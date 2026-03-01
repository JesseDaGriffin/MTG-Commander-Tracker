<template>
    <div
        class="relative overflow-hidden bg-tertiary border border-border-color rounded-xl p-6 sm:p-10 mb-8 flex items-center shadow-lg justify-between"
    >
        <div class="relative z-10 w-full sm:w-2/3">
            <span
                v-if="label"
                class="inline-block px-3 py-1 bg-accent-primary/10 text-accent-primary text-xs font-semibold rounded-full mb-3 border border-accent-primary/20"
            >
                {{ label }}
            </span>
            <h2
                class="text-3xl sm:text-4xl font-extrabold mb-2 text-white tracking-tight"
            >
                {{ title }}
            </h2>
            <p
                v-if="description"
                class="text-muted text-base sm:text-lg max-w-lg"
            >
                {{ description }}
            </p>
        </div>

        <!-- Optional Icon -->
        <div
            v-if="icon"
            class="hidden sm:block relative z-10 shrink-0 pr-4 opacity-75"
        >
            <div
                class="absolute inset-0 bg-accent-primary/20 blur-2xl rounded-full scale-150"
            ></div>
            <Icon
                :name="icon"
                class="text-7xl text-accent-primary relative drop-shadow-lg"
            />
        </div>
    </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        default: "",
    },
    description: {
        type: String,
        default: "",
    },
    icon: {
        type: String,
        default: "",
    },
});
</script>
