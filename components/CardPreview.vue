<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm transition-opacity"
        @click="close"
      ></div>
    </Transition>
    
    <Transition
      @enter="onEnter"
      @leave="onLeave"
      :css="false"
    >
      <div 
        v-if="isOpen" 
        class="fixed z-[101] cursor-pointer touch-manipulation origin-top-left"
        @click="close"
        :style="dynamicStyle"
      >
        <img 
          :src="imageUrl" 
          class="w-full h-full object-cover rounded-xl shadow-2xl ring-1 ring-white/20 transition-all duration-300 pointer-events-none" 
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, nextTick } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  imageUrl: String,
  originRect: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])
const dynamicStyle = ref({})

const close = () => {
  emit('close')
}

// Fixed dimensions for a standard MTG card ratio (approx 2.5 : 3.5)
const TARGET_WIDTH = 350
const TARGET_HEIGHT = 490

const updateTargetPosition = () => {
  // Center of viewport
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Scale down if viewport is too small
  let finalWidth = TARGET_WIDTH
  let finalHeight = TARGET_HEIGHT
  
  if (viewportWidth < finalWidth + 40) {
    finalWidth = viewportWidth - 40
    finalHeight = finalWidth * 1.4
  }
  if (viewportHeight < finalHeight + 40) {
    finalHeight = viewportHeight - 40
    finalWidth = finalHeight / 1.4
  }
  
  const targetX = (viewportWidth - finalWidth) / 2
  const targetY = (viewportHeight - finalHeight) / 2
  
  return { x: targetX, y: targetY, width: finalWidth, height: finalHeight }
}

const onEnter = (el, done) => {
  if (!props.originRect) return done()
  
  // 1. Set to origin position immediately
  const { top, left, width, height } = props.originRect
  
  el.style.top = `${top}px`
  el.style.left = `${left}px`
  el.style.width = `${width}px`
  el.style.height = `${height}px`
  el.style.transition = 'none' // remove transition to snap to origin
  
  // 2. Force reflow
  void el.offsetHeight
  
  // 3. Setup transition & animate to target
  const target = updateTargetPosition()
  
  el.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' // Nice bouncy curve
  el.style.top = `${target.y}px`
  el.style.left = `${target.x}px`
  el.style.width = `${target.width}px`
  el.style.height = `${target.height}px`
  
  // Wait for transition to finish
  setTimeout(done, 400)
}

const onLeave = (el, done) => {
  if (!props.originRect) return done()
  
  // Animate back to original placement
  const { top, left, width, height } = props.originRect
  
  el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  el.style.top = `${top}px`
  el.style.left = `${left}px`
  el.style.width = `${width}px`
  el.style.height = `${height}px`
  el.style.opacity = '0'
  
  setTimeout(done, 300)
}

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.originRect) {
    // Lock body scroll
    document.body.style.overflow = 'hidden'
  } else {
    // Restore body scroll
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
