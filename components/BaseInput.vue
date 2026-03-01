<template>
    <input
        :value="modelValue"
        @input="handleInput"
        @focus="handleFocus"
        class="form-input"
    />
</template>

<script setup>
defineProps({
    modelValue: {
        type: [String, Number],
        default: "",
    },
});

const emit = defineEmits(["update:modelValue", "input"]);

const handleInput = (event) => {
    emit("update:modelValue", event.target.value);
    emit("input", event);
};

const handleFocus = (event) => {
    // Only apply on mobile screens (width < 768px for Tailwind 'md' breakpoint)
    if (window.innerWidth < 768) {
        // Small delay to allow virtual keyboard to appear before scrolling
        setTimeout(() => {
            if (event.target) {
                const y =
                    event.target.getBoundingClientRect().top +
                    window.scrollY -
                    20;
                window.scrollTo({ top: y, behavior: "smooth" });
            }
        }, 150);
    }
};
</script>
