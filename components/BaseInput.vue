<template>
    <input :value="modelValue" @input="handleInput" class="form-input" />
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
</script>
