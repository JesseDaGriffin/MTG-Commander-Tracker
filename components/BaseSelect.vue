<template>
  <select
    :value="modelValue"
    @change="handleChange"
    class="form-input"
  >
    <slot></slot>
  </select>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleChange = (event) => {
  emit('update:modelValue', event.target.value)
  emit('change', event)
}
</script>
