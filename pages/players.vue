<template>
  <div class="page-fade-in">
    <div class="header-section">
      <h2 class="page-title">Players</h2>
      <p class="text-muted">Manage your playgroup and their details</p>
    </div>

    <!-- Add Player Form -->
    <div v-if="showAddForm" class="card p-6 mb-6 form-card">
      <h3 class="mb-4">Add New Player</h3>
      <form @submit.prevent="submitPlayer">
        <div class="form-group">
          <label class="form-label" for="playerName">Player Name</label>
          <input 
            id="playerName"
            v-model="newPlayerName" 
            type="text" 
            class="form-input" 
            placeholder="Enter player name" 
            required
            :disabled="isSubmitting"
          />
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="showAddForm = false" :disabled="isSubmitting">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <Icon v-if="isSubmitting" name="mdi:loading" class="spin-icon mr-2" />
            Save Player
          </button>
        </div>
      </form>
    </div>

    <!-- Player List -->
    <div class="card p-6">
      <div class="flex-between mb-4">
        <h3>Player List</h3>
        <button v-if="!showAddForm" class="btn btn-primary" @click="showAddForm = true">
          <Icon name="mdi:account-plus" class="mr-2" />
          Add Player
        </button>
      </div>
      
      <div v-if="isLoading" class="text-center p-6 text-muted">
        <Icon name="mdi:loading" class="spin-icon loading-large" />
      </div>
      
      <div v-else-if="players.length > 0" class="player-grid">
        <div v-for="player in players" :key="player.id" class="player-card">
          <div class="player-avatar">
            {{ player.name.substring(0, 2).toUpperCase() }}
          </div>
          <div class="player-info">
            <h4>{{ player.name }}</h4>
            <p class="text-xs text-muted">Joined {{ new Date(player.created_at).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <Icon name="mdi:account-group-outline" class="empty-icon" />
        <p>No players added yet.</p>
        <button class="btn btn-primary mt-6" @click="showAddForm = true">Add Your First Player</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const db = useDb()

const players = ref([])
const isLoading = ref(true)
const showAddForm = ref(false)
const newPlayerName = ref('')
const isSubmitting = ref(false)

const loadPlayers = async () => {
  isLoading.value = true
  try {
    players.value = await db.getPlayers()
  } catch (error) {
    console.error('Failed to load players:', error)
  } finally {
    isLoading.value = false
  }
}

const submitPlayer = async () => {
  if (!newPlayerName.value.trim()) return
  
  isSubmitting.value = true
  try {
    await db.addPlayer(newPlayerName.value.trim())
    newPlayerName.value = ''
    showAddForm.value = false
    await loadPlayers() // Reload the list
  } catch (error) {
    console.error('Failed to add player:', error)
    alert('Failed to add player. Name might already exist.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadPlayers()
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

.mt-4 {
  margin-top: 1.5rem;
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
