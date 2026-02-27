<template>
  <div class="flex items-center gap-4 bg-bg-tertiary p-4 rounded-md border border-border-color">
    <div class="flex-shrink-0 w-12 h-12 bg-accent-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
      {{ player.name.substring(0, 2).toUpperCase() }}
    </div>
    <div class="min-w-0">
      <h4 class="text-lg font-bold text-primary truncate">{{ player.name }}</h4>
      <p class="text-xs text-muted">Joined {{ new Date(player.created_at).toLocaleDateString() }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  player: {
    type: Object,
    required: true
  }
})
</script>
