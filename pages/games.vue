<template>
  <div class="page-fade-in">
    <div class="header-section">
      <h2 class="page-title">Games</h2>
      <p class="text-muted">Record new game results and view history</p>
    </div>

    <!-- Record Game Form -->
    <div v-if="showAddForm" class="card p-6 mb-6 form-card">
      <h3 class="mb-4">Record Game Result</h3>
      <form @submit.prevent="submitGame">
        <div class="form-group mb-4">
          <label class="form-label">Players & Decks</label>
          <div v-for="(participant, index) in newGame.participants" :key="index" class="participant-row mb-2">
            <select v-model="participant.playerId" class="form-input participant-select" @change="onPlayerChange(index)">
              <option value="">-- Player --</option>
              <option v-for="player in players" :key="player.id" :value="player.id">
                {{ player.name }}
              </option>
            </select>
            
            <select v-model="participant.deckId" class="form-input participant-select" :disabled="!participant.playerId">
              <option value="">-- Deck --</option>
              <option v-for="deck in getDecksForPlayer(participant.playerId)" :key="deck.id" :value="deck.id">
                {{ deck.commander_name }}
              </option>
            </select>
            
            <button v-if="newGame.participants.length > 2" type="button" class="btn-icon text-red" @click="removeParticipant(index)">
              <Icon name="mdi:close" />
            </button>
          </div>
          
          <button v-if="newGame.participants.length < 6" type="button" class="btn btn-secondary mt-2 text-sm" @click="addParticipant">
            <Icon name="mdi:plus" class="mr-1" /> Add Player
          </button>
        </div>

        <div class="form-group mb-4">
          <label class="form-label" for="winnerSelect">Winner</label>
          <select id="winnerSelect" v-model="newGame.winnerId" class="form-input" required>
            <option value="">-- Select Winner --</option>
            <option v-for="participant in validParticipants" :key="participant.playerId" :value="participant.playerId">
              {{ getPlayerName(participant.playerId) }}
            </option>
            <option value="draw">-- Draw / No Winner --</option>
          </select>
        </div>
        
        <div class="form-group mb-4">
          <label class="form-label" for="gameNotes">Notes (Optional)</label>
          <textarea id="gameNotes" v-model="newGame.notes" class="form-input" rows="2" placeholder="Any memorable moments?"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="showAddForm = false" :disabled="isSubmitting">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting || validParticipants.length < 2">
            <Icon v-if="isSubmitting" name="mdi:loading" class="spin-icon mr-2" />
            Save Game
          </button>
        </div>
      </form>
    </div>

    <!-- Game History -->
    <div class="card p-6">
      <div class="flex-between mb-4">
        <h3>Game History</h3>
        <button v-if="!showAddForm" class="btn btn-primary" @click="showAddForm = true">
          <Icon name="mdi:sword-cross" class="mr-2" />
          Record Game
        </button>
      </div>
      
      <div v-if="isLoading" class="text-center p-6 text-muted">
        <Icon name="mdi:loading" class="spin-icon loading-large" />
      </div>
      
      <div v-else-if="games.length > 0" class="game-list">
        <div v-for="game in games" :key="game.id" class="game-card">
          <div class="game-date">{{ new Date(game.played_on).toLocaleDateString() }}</div>
          <div class="game-winner">
            <span class="text-muted mr-2">Winner:</span>
            <span class="winner-name">
              <Icon name="mdi:crown" class="crown-icon" />
              {{ game.players?.name || 'Draw' }}
            </span>
          </div>
          <p v-if="game.notes" class="game-notes text-muted text-sm mt-2">"{{ game.notes }}"</p>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <Icon name="mdi:history" class="empty-icon" />
        <p>No games recorded yet.</p>
        <button v-if="!showAddForm" class="btn btn-primary mt-6" @click="showAddForm = true">Record Your First Game</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const db = useDb()
const supabase = useSupabaseClient()

const games = ref([])
const players = ref([])
const decks = ref([])
const isLoading = ref(true)
const showAddForm = ref(false)
const isSubmitting = ref(false)

const newGame = ref({
  participants: [
    { playerId: '', deckId: '' },
    { playerId: '', deckId: '' },
    { playerId: '', deckId: '' },
    { playerId: '', deckId: '' }
  ],
  winnerId: '',
  notes: ''
})

const validParticipants = computed(() => {
  return newGame.value.participants.filter(p => p.playerId)
})

const getDecksForPlayer = (playerId) => {
  if (!playerId) return []
  return decks.value.filter(d => d.player_id === playerId)
}

const getPlayerName = (playerId) => {
  const player = players.value.find(p => p.id === playerId)
  return player ? player.name : 'Unknown'
}

const addParticipant = () => {
  if (newGame.value.participants.length < 6) {
    newGame.value.participants.push({ playerId: '', deckId: '' })
  }
}

const removeParticipant = (index) => {
  newGame.value.participants.splice(index, 1)
  // Check if removed player was the winner
  if (newGame.value.winnerId && !validParticipants.value.find(p => p.playerId === newGame.value.winnerId)) {
    newGame.value.winnerId = ''
  }
}

const onPlayerChange = (index) => {
  // Reset deck when player changes
  newGame.value.participants[index].deckId = ''
}

const loadData = async () => {
  isLoading.value = true
  try {
    const [pData, dData, gData] = await Promise.all([
      db.getPlayers(),
      db.getDecks(),
      db.getGames()
    ])
    players.value = pData
    decks.value = dData
    games.value = gData
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoading.value = false
  }
}

const submitGame = async () => {
  if (validParticipants.value.length < 2) {
    alert('A game needs at least 2 players.')
    return
  }

  isSubmitting.value = true
  try {
    // 1. Insert Game
    const winnerId = newGame.value.winnerId === 'draw' ? null : newGame.value.winnerId
    const { data: gameData, error: gameError } = await supabase.from('games').insert([{
      winner_id: winnerId,
      notes: newGame.value.notes
    }]).select()
    
    if (gameError) throw gameError
    const gameId = gameData[0].id

    // 2. Insert Participants
    const participantInserts = validParticipants.value.map(p => ({
      game_id: gameId,
      player_id: p.playerId,
      deck_id: p.deckId || null
    }))
    
    const { error: partError } = await supabase.from('game_participants').insert(participantInserts)
    if (partError) throw partError

    // Success
    showAddForm.value = false
    newGame.value = {
      participants: [{ playerId: '', deckId: '' }, { playerId: '', deckId: '' }, { playerId: '', deckId: '' }, { playerId: '', deckId: '' }],
      winnerId: '',
      notes: ''
    }
    await loadData()
  } catch (error) {
    console.error('Failed to save game:', error)
    alert('Failed to save game.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.participant-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.participant-select {
  flex: 1;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s ease;
}

.btn-icon:hover {
  background-color: var(--bg-tertiary);
}

.text-red {
  color: #ef4444;
}

.game-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-card {
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  border-left: 4px solid var(--accent-primary);
}

.game-date {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.game-winner {
  font-size: 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.winner-name {
  color: var(--mtg-red); /* Using one of the MTG colors for winner highlight */
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.crown-icon {
  color: #fbbf24; /* Amber 400 */
}
</style>
