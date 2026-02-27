<template>
  <div class="relative flex gap-4 p-4 rounded-md border border-border-color bg-bg-tertiary hover:border-accent-primary transition-colors pr-14 group">
    <div class="flex-shrink-0 w-16 h-24 bg-bg-secondary rounded border border-border-color flex items-center justify-center overflow-hidden">
       <img v-if="deck.commander_image_url" :src="deck.commander_image_url" :alt="deck.commander_name" class="w-full h-full object-cover" />
       <Icon v-else name="mdi:cards-playing-outline" class="text-3xl text-muted" />
    </div>
    <div class="flex flex-col py-1 justify-center flex-1">
      <h4 class="font-bold text-primary text-[0.95rem] leading-snug">{{ deck.commander_name }}</h4>
    </div>
    
    <button 
      @click.stop="onDelete" 
      class="absolute right-3 top-3 text-white bg-red-600 hover:bg-red-500 hover:scale-105 w-8 h-8 rounded-full transition-all flex items-center justify-center shadow-md shadow-red-900/40 opacity-80 hover:opacity-100" 
      title="Delete Deck" 
      :disabled="isDeleting"
    >
      <Icon v-if="isDeleting" name="mdi:loading" class="animate-spin text-base" />
      <Icon v-else name="mdi:delete-outline" class="text-base" />
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  deck: {
    type: Object,
    required: true
  },
  isDeleting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete'])

const onDelete = () => {
  emit('delete', props.deck)
}
</script>
