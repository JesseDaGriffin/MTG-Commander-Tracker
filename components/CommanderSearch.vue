<template>
  <div class="commander-search">
    <div class="search-input-wrapper">
      <Icon name="mdi:magnify" class="search-icon" />
      <input 
        type="text" 
        v-model="searchQuery" 
        @input="debouncedSearch"
        placeholder="Search for a Commander..." 
        class="form-input search-input"
      />
      <div v-if="isLoading" class="loading-spinner">
        <Icon name="mdi:loading" class="spin-icon" />
      </div>
    </div>

    <!-- Dropdown Results -->
    <div v-if="showResults && results.length > 0" class="results-dropdown card">
      <div 
        v-for="card in results" 
        :key="card.id" 
        class="result-item"
        @click="selectCommander(card)"
      >
        <div class="card-image-placeholder">
          <img v-if="card.imageUrl" :src="card.imageUrl" :alt="card.name" />
          <Icon v-else name="mdi:cards-playing-outline" class="fallback-icon" />
        </div>
        <div class="card-details">
          <div class="card-name">{{ card.name }}</div>
          <div class="card-mana">{{ card.manaCost }}</div>
          <div class="card-type">{{ card.type }}</div>
        </div>
      </div>
    </div>

    <!-- No Results State -->
    <div v-else-if="showResults && searchQuery.length >= 3 && !isLoading" class="results-dropdown card p-4 text-center">
      <p class="text-muted">No commanders found for "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['select'])

const searchQuery = ref('')
const results = ref([])
const isLoading = ref(false)
const showResults = ref(false)
let debounceTimeout = null

const fetchCommanders = async (query) => {
  try {
    // Only fetch Legendary Creatures
    const response = await fetch(`https://api.magicthegathering.io/v1/cards?name=${encodeURIComponent(query)}&supertypes=Legendary&types=Creature&pageSize=10`)
    const data = await response.json()
    
    // Filter out duplicates (API sometimes returns multiple printings)
    // and keep only cards suitable for commanders
    const uniqueCards = []
    const seenNames = new Set()
    
    for (const card of data.cards) {
      if (!seenNames.has(card.name)) {
        seenNames.add(card.name)
        uniqueCards.push(card)
      }
    }
    
    results.value = uniqueCards
  } catch (error) {
    console.error('Error fetching commanders:', error)
    results.value = []
  } finally {
    isLoading.value = false
  }
}

const debouncedSearch = () => {
  clearTimeout(debounceTimeout)
  if (searchQuery.value.length < 3) {
    results.value = []
    showResults.value = false
    return
  }
  
  showResults.value = true
  isLoading.value = true
  
  debounceTimeout = setTimeout(() => {
    fetchCommanders(searchQuery.value)
  }, 500)
}

const selectCommander = (card) => {
  emit('select', {
    name: card.name,
    imageUrl: card.imageUrl,
    colors: card.colors || [],
    colorIdentity: card.colorIdentity || []
  })
  
  searchQuery.value = card.name
  showResults.value = false
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const searchEl = document.querySelector('.commander-search')
    if (searchEl && !searchEl.contains(e.target)) {
      showResults.value = false
    }
  })
})
</script>

<style scoped>
.commander-search {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
  font-size: 1.25rem;
}

.search-input {
  padding-left: 2.75rem;
  padding-right: 2.75rem;
  height: 3rem;
  font-size: 1rem;
}

.loading-spinner {
  position: absolute;
  right: 1rem;
  color: var(--accent-primary);
}

.spin-icon {
  animation: spin 1s linear infinite;
  font-size: 1.25rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.results-dropdown {
  position: absolute;
  top: Calc(100% + 0.5rem);
  left: 0;
  right: 0;
  z-index: 100;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.result-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.result-item:hover {
  background-color: var(--bg-tertiary);
}

.card-image-placeholder {
  width: 50px;
  height: 70px;
  background-color: var(--bg-primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border-color);
  flex-shrink: 0;
}

.card-image-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fallback-icon {
  font-size: 1.5rem;
  color: var(--text-muted);
}

.card-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.card-mana {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.card-type {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.text-center {
  text-align: center;
}
.p-4 {
  padding: 1rem;
}
</style>
