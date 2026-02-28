<template>
    <div class="bg-tertiary rounded-md p-5 border-l-4 border-l-accent-primary">
        <div class="text-xs text-muted mb-2">
            {{ new Date(game.played_on).toLocaleDateString() }}
        </div>
        <div class="text-lg font-semibold flex items-center">
            <span class="text-muted mr-2">Winner:</span>
            <span class="text-mtg-red flex items-center gap-1">
                <Icon name="mdi:crown" class="text-amber-400" />
                {{ game.players?.name || "Draw" }}
            </span>
        </div>
        <p v-if="game.notes" class="text-muted text-sm mt-3 italic">
            "{{ game.notes }}"
        </p>
    </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
    game: {
        type: Object,
        required: true,
    },
});
</script>
