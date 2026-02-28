<template>
  <div class="animate-fade-in">
    <div class="mb-8">
      <h2 class="text-3xl font-bold mb-1">Decks</h2>
      <p class="text-muted">Manage Commander decks for each player</p>
    </div>

    <div class="card p-6 mb-8 relative z-20">
      <h3 class="text-xl font-bold mb-4">Add New Deck</h3>
      
      <div class="mb-5">
        <label class="block text-sm font-medium text-secondary mb-2" for="playerSelect">Select Player</label>
        <select id="playerSelect" v-model="selectedPlayerId" class="form-input" :disabled="isLoading">
          <option value="">-- Choose a Player --</option>
          <option v-for="player in players" :key="player.id" :value="player.id">
            {{ player.name }}
          </option>
        </select>
      </div>

      <div class="mb-2">
        <label class="block text-sm font-medium text-secondary mb-2">Find Commander</label>
        <CommanderSearch ref="commanderSearchRef" @select="onCommanderSelect" />
      </div>
      
      <div v-if="selectedCommander" class="mt-6 border border-border-color rounded-md p-4 bg-bg-tertiary">
        <div class="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
          <img 
            v-if="selectedCommander.imageUrl" 
            :src="selectedCommander.imageUrl" 
            :alt="selectedCommander.name" 
            class="w-32 rounded-lg shadow-md cursor-pointer hover:shadow-glow hover:ring-2 hover:ring-accent-primary transition-all" 
            @click="onSelectedCommanderPreviewClick"
          />
          <div class="flex-1">
            <h4 class="text-lg font-bold text-primary">{{ selectedCommander.name }}</h4>
            <p class="text-sm text-muted mb-4">Selected Commander</p>
            <button class="btn btn-primary" @click="saveDeck" :disabled="isSubmitting || !selectedPlayerId">
              <Icon v-if="isSubmitting" name="mdi:loading" class="animate-spin mr-2" />
              Save Deck
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-6">
      <div class="flex items-center justify-between border-b border-border-color pb-4 mb-6 gap-4">
        <h3 class="text-xl font-bold">Deck Roster</h3>
        <div class="relative w-full max-w-xs">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="mdi:magnify" class="text-muted" />
          </div>
          <input 
            v-model="playerSearchQuery" 
            type="text" 
            placeholder="Search players..." 
            class="form-input pl-10"
          />
        </div>
      </div>
      
      <div v-if="isLoading" class="flex justify-center p-6 text-muted">
        <Icon name="mdi:loading" class="animate-spin text-5xl" />
      </div>

      <div v-else-if="Object.keys(groupedDecks).length > 0" class="flex flex-col gap-8">
        <div v-for="(playerDecks, playerName) in groupedDecks" :key="playerName" class="player-group">
          <h4 class="text-lg font-bold text-secondary mb-4 border-b border-border-color pb-1 inline-block">{{ playerName }}'s Decks</h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <DeckCard 
                v-for="deck in playerDecks" 
                :key="deck.id" 
                :deck="deck" 
                :is-deleting="isDeleting === deck.id" 
                @delete="deleteDeck" 
                @preview="openPreview"
              />
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center p-12 text-center text-muted">
        <Icon name="mdi:cards-outline" class="text-5xl mb-4 opacity-50" />
        <p v-if="playerSearchQuery">No players found matching "{{ playerSearchQuery }}".</p>
        <p v-else>No decks added yet.</p>
      </div>
    </div>
    
    <CardPreview 
      :is-open="previewState.isOpen"
      :image-url="previewState.url"
      :origin-rect="previewState.rect"
      @close="previewState.isOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const db = useDb()

const selectedCommander = ref(null)
const players = ref([])
const selectedPlayerId = ref('')
const isSubmitting = ref(false)
const isDeleting = ref(null)
const decks = ref([])
const isLoading = ref(true)
const commanderSearchRef = ref(null)
const playerSearchQuery = ref('')

const previewState = ref({
  isOpen: false,
  url: '',
  rect: null
})

const openPreview = ({ url, rect }) => {
  previewState.value = {
    isOpen: true,
    url,
    rect
  }
}

const onSelectedCommanderPreviewClick = (e) => {
  if (!selectedCommander.value?.imageUrl) return
  const rect = e.currentTarget.getBoundingClientRect()
  openPreview({ url: selectedCommander.value.imageUrl, rect })
}

const groupedDecks = computed(() => {
  const groups = {}
  const query = playerSearchQuery.value.toLowerCase().trim()
  
  decks.value.forEach(deck => {
    const playerName = deck.players?.name || 'Unknown Player'
    
    if (query && !playerName.toLowerCase().includes(query)) {
      return
    }
    
    if (!groups[playerName]) {
      groups[playerName] = []
    }
    groups[playerName].push(deck)
  })
  return groups
})

const loadInitialData = async () => {
  isLoading.value = true
  try {
    const [playersData, decksData] = await Promise.all([
      db.getPlayers(),
      db.getDecks()
    ])
    players.value = playersData
    decks.value = decksData
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoading.value = false
  }
}

const onCommanderSelect = (commander) => {
  selectedCommander.value = commander
}

const saveDeck = async () => {
  if (!selectedPlayerId.value) {
    alert('Please select a player for this deck.')
    return
  }

  isSubmitting.value = true
  try {
    await db.addDeck(
      selectedPlayerId.value, 
      selectedCommander.value.name, 
      selectedCommander.value.imageUrl
    )
    selectedCommander.value = null
    selectedPlayerId.value = ''
    if (commanderSearchRef.value) {
      commanderSearchRef.value.clearSearch()
    }
    await loadInitialData()
  } catch (error) {
    console.error('Error saving deck:', error)
    alert('Failed to save deck.')
  } finally {
    isSubmitting.value = false
  }
}

const deleteDeck = async (deck) => {
  if (!confirm(`Are you sure you want to remove ${deck.commander_name} from the list?`)) {
    return
  }
  
  isDeleting.value = deck.id
  try {
    await db.deleteDeck(deck.id)
    await loadInitialData()
  } catch (error) {
    console.error('Error soft-deleting deck:', error)
    alert('Failed to delete deck.')
  } finally {
    isDeleting.value = null
  }
}

onMounted(() => {
  loadInitialData()
})
</script>
