<template>
    <span class="inline-flex items-center gap-1.5 min-w-0" :class="customClass">
        <!-- Render icon on the left if specified -->
        <template v-if="iconPosition === 'left'">
            <Icon
                v-if="isYou"
                name="mdi:account"
                class="text-accent-primary shrink-0 opacity-90"
                :class="iconSizeClass"
                title="You"
            />
            <Icon
                v-else-if="isFriend"
                name="mdi:account-heart"
                class="text-mtg-red shrink-0 opacity-90"
                :class="iconSizeClass"
                title="Friend"
            />
            <span class="truncate"
                >{{ player?.name || "Unknown Player" }}{{ suffix }}</span
            >
        </template>

        <!-- Default: Render icon on the right -->
        <template v-else>
            <span class="truncate"
                >{{ player?.name || "Unknown Player" }}{{ suffix }}</span
            >
            <Icon
                v-if="isYou"
                name="mdi:account"
                class="text-accent-primary shrink-0 opacity-90"
                :class="iconSizeClass"
                title="You"
            />
            <Icon
                v-else-if="isFriend"
                name="mdi:account-heart"
                class="text-mtg-red shrink-0 opacity-90"
                :class="iconSizeClass"
                title="Friend"
            />
        </template>
    </span>
</template>

<script setup>
import { computed } from "vue";
const user = useSupabaseUser();

const props = defineProps({
    player: {
        type: Object,
        required: true,
    },
    customClass: {
        type: String,
        default: "",
    },
    iconSizeClass: {
        type: String,
        default: "text-[1em]",
    },
    suffix: {
        type: String,
        default: "",
    },
    iconPosition: {
        type: String,
        default: "right", // "left" or "right"
    },
});

const isYou = computed(() => {
    // Check if we already mapped it in getPlayers
    if (props.player?._is_you !== undefined) return props.player._is_you;
    // Otherwise fallback to raw db values
    return (
        props.player?.is_profile &&
        props.player?.user_id === (user.value?.id || user.value?.sub)
    );
});

const isFriend = computed(() => {
    if (props.player?._is_friend !== undefined) return props.player._is_friend;
    return (
        props.player?.is_profile &&
        props.player?.user_id !== (user.value?.id || user.value?.sub)
    );
});
</script>
