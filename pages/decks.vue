<template>
  <div class="animate-fade-in">
    <div class="mb-8">
      <h2 class="text-3xl font-bold mb-1">Decks</h2>
      <p class="text-muted">Manage Commander decks for each player</p>
    </div>

    <div class="card p-6 mb-8">
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
        <CommanderSearch @select="onCommanderSelect" />
      </div>
      
      <div v-if="selectedCommander" class="mt-6 border border-border-color rounded-md p-4 bg-bg-tertiary">
        <div class="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
          <img v-if="selectedCommander.imageUrl" :src="selectedCommander.imageUrl" :alt="selectedCommander.name" class="w-32 rounded-lg shadow-md" />
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
      <div class="flex items-center justify-between border-b border-border-color pb-4 mb-4">
        <h3 class="text-xl font-bold">Deck Roster</h3>
      </div>
      
      <div v-if="isLoading" class="flex justify-center p-6 text-muted">
        <Icon name="mdi:loading" class="animate-spin text-5xl" />
      </div>

      <div v-else-if="decks.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="deck in decks" :key="deck.id" class="flex gap-4 p-4 rounded-md border border-border-color bg-bg-tertiary">
          <div class="flex-shrink-0 w-20 h-28 bg-bg-secondary rounded border border-border-color flex items-center justify-center overflow-hidden">
             <img v-if="deck.commander_image_url" :src="deck.commander_image_url" :alt="deck.commander_name" class="w-full h-full object-cover" />
             <Icon v-else name="mdi:cards-playing-outline" class="text-3xl text-muted" />
          </div>
          <div class="flex flex-col py-1">
            <span class="inline-block bg-accent-primary/20 text-accent-primary text-xs font-semibold px-2 py-0.5 rounded w-fit mb-2">{{ deck.players?.name || 'Unknown Player' }}</span>
            <h4 class="font-bold text-primary text-[0.95rem] leading-snug">{{ deck.commander_name }}</h4>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center p-12 text-center text-muted">
        <Icon name="mdi:cards-outline" class="text-5xl mb-4 opacity-50" />
        <p>No decks added yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const db = useDb()

const selectedCommander = ref(null)
const players = ref([])
const selectedPlayerId = ref('')
const isSubmitting = ref(false)
const decks = ref([])
const isLoading = ref(true)

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
    await loadInitialData()
  } catch (error) {
    console.error('Error saving deck:', error)
    alert('Failed to save deck.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadInitialData()
})
</script>
