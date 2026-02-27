<template>
  <div class="relative w-full commander-search">
    <div class="relative flex items-center">
      <Icon name="mdi:magnify" class="absolute left-4 text-muted text-xl" />
      <input 
        type="text" 
        v-model="searchQuery" 
        @input="debouncedSearch"
        placeholder="Search for a Commander..." 
        class="form-input pl-11 pr-11 h-12 text-base w-full"
      />
      <div v-if="isLoading" class="absolute right-4 text-accent-primary">
        <Icon name="mdi:loading" class="animate-spin text-xl" />
      </div>
    </div>

    <!-- Dropdown Results -->
    <div v-if="showResults && results.length > 0" class="absolute top-[calc(100%+0.5rem)] left-0 right-0 z-50 max-h-[400px] overflow-y-auto p-2 flex flex-col gap-1 card shadow-xl">
      <div 
        v-for="card in results" 
        :key="card.id" 
        class="flex gap-4 p-3 rounded-md cursor-pointer transition-colors hover:bg-bg-tertiary"
        @click="selectCommander(card)"
      >
        <div class="w-[50px] h-[70px] bg-bg-primary rounded-sm flex items-center justify-center overflow-hidden border border-border-color flex-shrink-0">
          <img v-if="card.imageUrl" :src="card.imageUrl" :alt="card.name" class="w-full h-full object-cover" />
          <Icon v-else name="mdi:cards-playing-outline" class="text-2xl text-muted" />
        </div>
        <div class="flex flex-col justify-center">
          <div class="font-semibold text-primary mb-1">{{ card.name }}</div>
          <div class="text-xs text-secondary font-mono">{{ card.manaCost }}</div>
          <div class="text-xs text-muted">{{ card.type }}</div>
        </div>
      </div>
    </div>

    <!-- No Results State -->
    <div v-else-if="showResults && searchQuery.length >= 3 && !isLoading" class="absolute top-[calc(100%+0.5rem)] left-0 right-0 z-50 p-4 text-center card shadow-xl">
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
    // Only search for legendary creatures using Scryfall search syntax
    const scryfallQuery = encodeURIComponent(`t:legend t:creature ${query}`)
    const response = await fetch(`https://api.scryfall.com/cards/search?q=${scryfallQuery}`)
    const data = await response.json()
    
    if (data.object === 'error') {
      results.value = []
      return
    }
    
    const uniqueCards = []
    const seenNames = new Set()
    
    // Scryfall returns results in the 'data' array. Limit to top 15 matches.
    const fetchedCards = data.data || []
    const limitedCards = fetchedCards.slice(0, 15)
    
    for (const card of limitedCards) {
      if (!seenNames.has(card.name)) {
        seenNames.add(card.name)
        
        // Handle double-faced cards by falling back to the front face's image_uris safely
        const imageUrl = card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || ''
        const manaCost = card.mana_cost || card.card_faces?.[0]?.mana_cost || ''
        const colors = card.colors || card.card_faces?.[0]?.colors || []
        
        uniqueCards.push({
          id: card.id,
          name: card.name,
          manaCost: manaCost,
          type: card.type_line,
          imageUrl: imageUrl,
          colors: colors,
          colorIdentity: card.color_identity || []
        })
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

const clearSearch = () => {
  searchQuery.value = ''
  results.value = []
  showResults.value = false
}

defineExpose({
  clearSearch
})

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
