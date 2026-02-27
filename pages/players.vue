<template>
  <div class="animate-fade-in">
    <div class="mb-8">
      <h2 class="text-3xl font-bold mb-1">Players</h2>
      <p class="text-muted">Manage your playgroup and their details</p>
    </div>

    <!-- Add Player Form -->
    <div v-if="showAddForm" class="card p-6 mb-6">
      <h3 class="text-xl mb-4 font-bold">Add New Player</h3>
      <form @submit.prevent="submitPlayer">
        <div class="form-group mb-4">
          <label class="form-label block text-sm font-medium text-secondary mb-2" for="playerName">Player Name</label>
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
        <div class="flex gap-3 justify-end mt-6">
          <button type="button" class="btn btn-secondary" @click="showAddForm = false" :disabled="isSubmitting">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <Icon v-if="isSubmitting" name="mdi:loading" class="animate-spin mr-2" />
            Save Player
          </button>
        </div>
      </form>
    </div>

    <!-- Player List -->
    <div class="card p-6">
      <div class="flex items-center justify-between border-b border-border-color pb-4 mb-4">
        <h3 class="text-xl font-bold">Player List</h3>
        <button v-if="!showAddForm" class="btn btn-primary" @click="showAddForm = true">
          <Icon name="mdi:account-plus" class="mr-2" />
          Add Player
        </button>
      </div>
      
      <div v-if="isLoading" class="flex justify-center p-6 text-muted">
        <Icon name="mdi:loading" class="animate-spin text-5xl" />
      </div>
      
      <div v-else-if="players.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="player in players" :key="player.id" class="flex items-center gap-4 bg-bg-tertiary p-4 rounded-md border border-border-color">
          <div class="flex-shrink-0 w-12 h-12 bg-accent-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
            {{ player.name.substring(0, 2).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <h4 class="text-lg font-bold text-primary truncate">{{ player.name }}</h4>
            <p class="text-xs text-muted">Joined {{ new Date(player.created_at).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>
      
      <div v-else class="flex flex-col items-center justify-center p-12 text-center text-muted">
        <Icon name="mdi:account-group-outline" class="text-5xl mb-4 opacity-50" />
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
