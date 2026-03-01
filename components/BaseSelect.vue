<template>
    <div
        class="relative w-full base-select-wrapper"
        :class="isOpen ? 'z-50' : 'z-10'"
        ref="wrapperRef"
    >
        <!-- Visible Search/Display Input -->
        <div class="relative">
            <input
                type="text"
                v-model="searchQuery"
                :placeholder="placeholder"
                :disabled="disabled"
                @focus="open"
                @click="open"
                @input="onInput"
                @keydown.down.prevent="onArrowDown"
                @keydown.up.prevent="onArrowUp"
                @keydown.enter.prevent="onEnter"
                @keydown.esc.prevent="close"
                class="form-input w-full pr-8 cursor-pointer bg-tertiary border border-border-color rounded-md"
                :class="{ 'opacity-50 cursor-not-allowed': disabled }"
                role="combobox"
                :aria-expanded="isOpen"
                aria-controls="options-list"
            />

            <!-- Dropdown Icon -->
            <div
                class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted"
            >
                <Icon
                    :name="isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'"
                    class="text-xl"
                />
            </div>
        </div>

        <!-- Options List Layer (Teleported or Absolute) -->
        <div
            v-show="isOpen"
            id="options-list"
            class="absolute left-0 w-full mt-1 bg-tertiary border border-border-color rounded-md shadow-lg max-h-60 overflow-y-auto z-[100]"
            style="
                min-width: 100%;
                box-shadow:
                    0 10px 25px -5px rgba(0, 0, 0, 0.5),
                    0 8px 10px -6px rgba(0, 0, 0, 0.5);
            "
        >
            <ul role="listbox" class="py-1 m-0 list-none p-0">
                <li
                    v-if="filteredOptions.length === 0"
                    class="px-3 py-2 text-sm text-muted text-center"
                >
                    No options found
                </li>
                <li
                    v-for="(option, index) in filteredOptions"
                    :key="option.value"
                    role="option"
                    :aria-selected="modelValue === option.value"
                    class="px-3 py-2 cursor-pointer flex items-center justify-between text-base"
                    :class="[
                        option.disabled
                            ? 'opacity-50 cursor-not-allowed bg-tertiary text-muted'
                            : 'hover:bg-tertiary transition-colors',
                        index === highlightedIndex && !option.disabled
                            ? 'bg-tertiary'
                            : '',
                        modelValue === option.value
                            ? 'text-accent-primary font-medium'
                            : 'text-text-primary',
                    ]"
                    @click="selectOption(option)"
                    @mouseenter="highlightedIndex = index"
                >
                    <span class="truncate block w-full">{{
                        option.label
                    }}</span>
                    <Icon
                        v-if="modelValue === option.value"
                        name="mdi:check"
                        class="ml-2 flex-shrink-0"
                    />
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: "",
    },
    options: {
        type: Array,
        default: () => [],
    },
    placeholder: {
        type: String,
        default: "Select an option",
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["update:modelValue", "change"]);

const wrapperRef = ref(null);
const isOpen = ref(false);
const searchQuery = ref("");
const highlightedIndex = ref(-1);

// Find currently selected option based on model value
const selectedOption = computed(() =>
    props.options.find((opt) => opt.value === props.modelValue),
);

// Initialize or reset search input text
const resetSearchQuery = () => {
    searchQuery.value = selectedOption.value ? selectedOption.value.label : "";
};

// Watch modelValue from parent to update input text
watch(
    () => props.modelValue,
    () => {
        if (!isOpen.value) {
            resetSearchQuery();
        }
    },
    { immediate: true },
);

// Filter options based on search query
const filteredOptions = computed(() => {
    // If dropdown is open and there's a search string, filter
    if (
        isOpen.value &&
        searchQuery.value &&
        searchQuery.value !== selectedOption.value?.label
    ) {
        const q = searchQuery.value.toLowerCase();
        return props.options.filter((opt) =>
            opt.label.toLowerCase().includes(q),
        );
    }
    return props.options;
});

// Focus / Open handlers
const open = (event) => {
    if (props.disabled) return;
    isOpen.value = true;
    highlightedIndex.value = props.options.findIndex(
        (opt) => opt.value === props.modelValue,
    );

    // Scroll into view on mobile
    if (window.innerWidth < 768 && event && event.target) {
        setTimeout(() => {
            const y =
                event.target.getBoundingClientRect().top + window.scrollY - 20;
            window.scrollTo({ top: y, behavior: "smooth" });
        }, 150);
    }
};

const close = () => {
    isOpen.value = false;
    resetSearchQuery();
    highlightedIndex.value = -1;
};

const onInput = () => {
    isOpen.value = true;
    highlightedIndex.value = 0; // Auto highlight first match
};

const selectOption = (option) => {
    if (option.disabled) return;

    searchQuery.value = option.label;
    emit("update:modelValue", option.value);
    emit("change", option.value);
    close();
};

// Keyboard Navigation
const onArrowDown = () => {
    if (!isOpen.value) {
        open();
        return;
    }
    if (highlightedIndex.value < filteredOptions.value.length - 1) {
        highlightedIndex.value++;
    }
};

const onArrowUp = () => {
    if (!isOpen.value) {
        open();
        return;
    }
    if (highlightedIndex.value > 0) {
        highlightedIndex.value--;
    }
};

const onEnter = () => {
    if (
        isOpen.value &&
        highlightedIndex.value >= 0 &&
        highlightedIndex.value < filteredOptions.value.length
    ) {
        selectOption(filteredOptions.value[highlightedIndex.value]);
    }
};

// Outside click handling
const handleClickOutside = (e) => {
    if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
        close();
    }
};

onMounted(() => {
    document.addEventListener("mousedown", handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener("mousedown", handleClickOutside);
});
</script>

<style scoped>
/* Isolate the select stacking completely to root out overlap issues */
.base-select-wrapper {
    position: relative;
}

#options-list {
    /* Force it over EVERYTHING else on the page */
    z-index: 999999 !important;
}
</style>
