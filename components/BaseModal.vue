<template>
    <Teleport to="body">
        <Transition name="modal">
            <!-- Focus trap wrapper with higher z-index -->
            <div
                v-if="modelValue"
                class="fixed inset-0 z-[100] flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none p-4"
                @click.self="closeOnOutsideClick ? close() : null"
            >
                <!-- Backdrop with blur -->
                <div
                    class="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    @click="closeOnOutsideClick ? close() : null"
                ></div>

                <!-- Modal Content -->
                <div
                    class="relative w-full max-w-md mx-auto my-6 p-6 shadow-glow bg-tertiary rounded-xl border border-border-color transform transition-all"
                    role="dialog"
                    aria-modal="true"
                    :aria-labelledby="title ? 'modal-title' : undefined"
                >
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-4">
                        <h3
                            v-if="title"
                            class="text-xl font-bold text-primary"
                            id="modal-title"
                        >
                            {{ title }}
                        </h3>
                        <!-- If no title, still keep the close button aligned to the right by adding an empty div -->
                        <div v-else></div>
                        <button
                            v-if="showClose"
                            @click="close"
                            class="p-1 ml-auto border-0 text-muted hover:text-primary transition-colors focus:outline-none rounded-full hover:bg-bg-secondary"
                            aria-label="Close"
                        >
                            <Icon name="mdi:close" class="text-xl" />
                        </button>
                    </div>

                    <!-- Body -->
                    <div
                        class="relative py-2 text-secondary text-sm md:text-base mb-6"
                    >
                        <slot></slot>
                    </div>

                    <!-- Footer -->
                    <div
                        class="flex items-center justify-end gap-3 pt-4 border-t border-border-color"
                    >
                        <slot name="footer">
                            <BaseButton variant="ghost" @click="close">
                                Cancel
                            </BaseButton>
                            <BaseButton
                                variant="primary"
                                @click="confirm"
                                :disabled="loading"
                                :loading="loading"
                            >
                                Confirm
                            </BaseButton>
                        </slot>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, onUnmounted, watch } from "vue";

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: "",
    },
    showClose: {
        type: Boolean,
        default: true,
    },
    closeOnOutsideClick: {
        type: Boolean,
        default: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["update:modelValue", "close", "confirm"]);

const close = () => {
    emit("update:modelValue", false);
    emit("close");
};

const confirm = () => {
    emit("confirm");
};

// Handle escape key to close modal
const handleKeydown = (e) => {
    if (e.key === "Escape" && props.modelValue) {
        close();
    }
};

onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
});

// Prevent body scrolling when modal is open
watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen) {
            // Calculate scrollbar width to prevent desktop layout shift
            const scrollbarWidth =
                window.innerWidth - document.documentElement.clientWidth;
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.paddingRight = "";
            document.body.style.overflow = "";
        }
    },
);
</script>

<style scoped>
/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .relative.max-w-md,
.modal-leave-active .relative.max-w-md {
    transition:
        transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 0.3s ease;
}

.modal-enter-from .relative.max-w-md {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
}

.modal-leave-to .relative.max-w-md {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
}
</style>
