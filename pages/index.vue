<template>
  <div class="dashboard page-fade-in">
    <div class="header-section">
      <h2 class="page-title">Dashboard</h2>
      <p class="text-muted">Overview of your Arcane Ledger games</p>
    </div>

    <div v-if="isLoading" class="text-center p-6 text-muted">
      <Icon name="mdi:loading" class="spin-icon loading-large" />
    </div>

    <div v-else>
      <div class="stats-grid">
        <div class="stat-card card">
          <Icon name="mdi:account-group" class="stat-icon" />
          <div class="stat-info">
            <h3>Total Players</h3>
            <p class="stat-value">{{ metrics.totalPlayers }}</p>
          </div>
        </div>
        <div class="stat-card card">
          <Icon name="mdi:cards" class="stat-icon" />
          <div class="stat-info">
            <h3>Total Decks</h3>
            <p class="stat-value">{{ metrics.totalDecks }}</p>
          </div>
        </div>
        <div class="stat-card card">
          <Icon name="mdi:sword-cross" class="stat-icon" />
          <div class="stat-info">
            <h3>Games Played</h3>
            <p class="stat-value">{{ metrics.totalGames }}</p>
          </div>
        </div>
      </div>
      
      <div class="recent-activity card mt-6">
        <h3 class="section-title">Recent Games</h3>
        
        <div v-if="recentGames.length > 0" class="game-list pb-2">
          <div v-for="game in recentGames" :key="game.id" class="recent-game-item">
            <div class="game-date">{{ new Date(game.played_on).toLocaleDateString() }}</div>
            <div class="game-winner">
              <span class="text-muted mr-2">Winner:</span>
              <span class="winner-name">
                <Icon name="mdi:crown" class="crown-icon" />
                {{ game.players?.name || 'Draw' }}
              </span>
            </div>
          </div>
          <NuxtLink to="/games" class="btn btn-secondary mt-4 w-full justify-center">View All Games</NuxtLink>
        </div>

        <div v-else class="empty-state">
          <Icon name="mdi:inbox" class="empty-icon" />
          <p>No games recorded yet. Start playing!</p>
          <NuxtLink to="/games" class="btn btn-primary mt-6">Record Game</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const db = useDb()
const isLoading = ref(true)

const metrics = ref({
  totalPlayers: 0,
  totalDecks: 0,
  totalGames: 0
})

const recentGames = ref([])

onMounted(async () => {
  isLoading.value = true
  try {
    const [players, decks, games] = await Promise.all([
      db.getPlayers(),
      db.getDecks(),
      db.getGames()
    ])
    
    metrics.value.totalPlayers = players.length
    metrics.value.totalDecks = decks.length
    metrics.value.totalGames = games.length
    
    // Get top 3 most recent games
    recentGames.value = games.slice(0, 3)
  } catch (error) {
    console.error('Failed to load dashboard metrics:', error)
  } finally {
    isLoading.value = false
  }
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  border-left: 4px solid var(--accent-primary);
}

.stat-icon {
  font-size: 2.5rem;
  color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.1);
  padding: 0.5rem;
  border-radius: var(--radius-md);
}

.stat-info h3 {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.mt-6 {
  margin-top: 1.5rem;
}

.mt-4 {
  margin-top: 1rem;
}

.section-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
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
