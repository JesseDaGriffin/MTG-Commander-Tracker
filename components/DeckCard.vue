<template>
    <div
        @click="navigateToDeck"
        class="relative flex gap-4 p-4 rounded-md border border-border-color bg-tertiary hover:border-accent-primary hover:shadow-glow transition-all pr-14 group cursor-pointer"
    >
        <div
            class="flex-shrink-0 w-16 h-24 bg-bg-secondary rounded border border-border-color flex items-center justify-center overflow-hidden"
            :class="{
                'hover:border-accent-primary hover:shadow-glow transition-all':
                    deck.commander_image_url,
            }"
            @click.stop="onPreviewClick"
        >
            <img
                v-if="deck.commander_image_url"
                :src="deck.commander_image_url"
                :alt="deck.commander_name"
                class="w-full h-full object-cover"
            />
            <Icon
                v-else
                name="mdi:cards-playing-outline"
                class="text-3xl text-muted"
            />
        </div>
        <div class="flex flex-col py-1 justify-center flex-1">
            <h4 class="font-bold text-primary text-[0.95rem] leading-snug">
                {{ deck.commander_name }}
            </h4>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
    deck: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["preview"]);
const router = useRouter();

const navigateToDeck = () => {
    router.push(`/decks/${props.deck.id}`);
};

const onPreviewClick = (e) => {
    if (!props.deck.commander_image_url) return;
    const rect = e.currentTarget.getBoundingClientRect();
    emit("preview", { url: props.deck.commander_image_url, rect });
};
</script>
