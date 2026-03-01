<template>
    <component
        :is="isLink ? NuxtLink : 'button'"
        :to="to"
        :type="isLink ? undefined : type"
        :disabled="disabled || loading"
        class="btn"
        :class="[variantClass, customClass]"
    >
        <span v-if="loading" class="mr-2 flex items-center">
            <Icon name="mdi:loading" class="animate-spin text-lg" />
        </span>
        <span v-if="icon && !loading" class="mr-2 flex items-center">
            <Icon :name="icon" class="text-lg" />
        </span>
        <slot />
    </component>
</template>

<script setup>
import { computed } from "vue";
import { resolveComponent } from "vue";

const NuxtLink = resolveComponent("NuxtLink");

const props = defineProps({
    variant: {
        type: String,
        default: "primary", // 'primary', 'secondary', 'danger', 'ghost'
        validator: (value) =>
            ["primary", "secondary", "danger", "ghost"].includes(value),
    },
    type: {
        type: String,
        default: "button",
    },
    to: {
        type: [String, Object],
        default: null,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    icon: {
        type: String,
        default: null,
    },
    customClass: {
        type: String,
        default: "",
    },
});

const isLink = computed(() => !!props.to);

const variantClass = computed(() => {
    if (props.variant === "ghost")
        return "border border-white/10 text-sm hover:bg-white/5";
    if (props.variant === "danger")
        return "bg-slate-800 text-mtg-red border border-mtg-red/30 hover:bg-red-900/40 hover:border-mtg-red text-sm";
    return `btn-${props.variant}`;
});
</script>
