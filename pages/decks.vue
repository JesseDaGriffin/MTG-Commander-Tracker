<template>
  <div class="page-fade-in">
    <div class="header-section">
      <h2 class="page-title">Decks</h2>
      <p class="text-muted">Manage Commander decks for each player</p>
    </div>

    <div class="card p-6 mb-6">
      <h3 class="mb-4">Add New Deck</h3>
      
      <div class="form-group">
        <label class="form-label" for="playerSelect">Select Player</label>
        <select id="playerSelect" v-model="selectedPlayerId" class="form-input" :disabled="isLoading">
          <option value="">-- Choose a Player --</option>
          <option v-for="player in players" :key="player.id" :value="player.id">
            {{ player.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Find Commander</label>
        <CommanderSearch @select="onCommanderSelect" />
      </div>
      
      <div v-if="selectedCommander" class="selected-commander-preview mt-4">
        <div class="preview-card">
          <img v-if="selectedCommander.imageUrl" :src="selectedCommander.imageUrl" :alt="selectedCommander.name" class="commander-img" />
          <div class="preview-details">
            <h4>{{ selectedCommander.name }}</h4>
            <p class="text-muted text-sm">Selected Commander</p>
            <button class="btn btn-primary mt-2" @click="saveDeck" :disabled="isSubmitting || !selectedPlayerId">
              <Icon v-if="isSubmitting" name="mdi:loading" class="spin-icon mr-2" />
              Save Deck
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-6">
      <div class="flex-between mb-4">
        <h3>Deck Roster</h3>
      </div>
      
      <div v-if="isLoading" class="text-center p-6 text-muted">
        <Icon name="mdi:loading" class="spin-icon loading-large" />
      </div>

      <div v-else-if="decks.length > 0" class="deck-grid">
        <div v-for="deck in decks" :key="deck.id" class="deck-card">
          <div class="deck-image-wrapper">
             <img v-if="deck.commander_image_url" :src="deck.commander_image_url" :alt="deck.commander_name" />
             <Icon v-else name="mdi:cards-playing-outline" class="fallback-icon" />
          </div>
          <div class="deck-info">
            <div class="player-badge">{{ deck.players?.name || 'Unknown Player' }}</div>
            <h4>{{ deck.commander_name }}</h4>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <Icon name="mdi:cards-outline" class="empty-icon" />
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

<style scoped>
.page-fade-in {
  animation: fadeIn 0.4s ease forwards;
}

.header-section {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.875rem;
  margin-bottom: 0.25rem;
}

.text-muted {
  color: var(--text-muted);
}

.p-6 {
  padding: 1.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

h3 {
  font-size: 1.25rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}
</style>
