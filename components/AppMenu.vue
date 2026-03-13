<template>
    <div class="relative" :class="{ 'w-full h-full': menuAnchor === 'bottom' }">
        <!-- Desktop/Mobile Trigger Button -->
        <button
            @click="isOpen = !isOpen"
            class="flex flex-col items-center justify-center transition-colors text-secondary hover:text-primary relative"
            :class="[
                customClass,
                menuAnchor === 'top'
                    ? 'p-2 rounded-md hover:bg-slate-700/50'
                    : 'w-full h-full gap-1 p-0',
                {
                    'text-primary bg-slate-700/50':
                        isOpen && menuAnchor === 'top',
                    '!text-accent-primary': isOpen && menuAnchor === 'bottom',
                },
            ]"
            aria-label="Toggle Menu"
        >
            <div class="relative flex">
                <Icon :name="iconName" class="text-2xl leading-none" />
                <!-- Notification Dot for Trigger -->
                <span
                    v-if="pendingRequestsCount > 0"
                    class="absolute -top-1 -right-1 flex h-3 w-3"
                >
                    <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-mtg-red opacity-75"
                    ></span>
                    <span
                        class="relative inline-flex rounded-full h-3 w-3 bg-mtg-red border-2 border-slate-900"
                    ></span>
                </span>
            </div>
            <span v-if="showLabel" class="text-[0.7rem] font-medium">Menu</span>
        </button>

        <!-- Invisible Backdrop to close menu -->
        <div
            v-if="isOpen"
            @click="isOpen = false"
            class="fixed inset-0 z-[60]"
        ></div>

        <!-- Dropdown Menu -->
        <transition name="dropdown">
            <div
                v-if="isOpen"
                class="w-56 bg-slate-800/95 backdrop-blur-md border border-border-color rounded-xl shadow-2xl z-[70] overflow-hidden flex flex-col transform"
                :class="
                    menuAnchor === 'bottom'
                        ? 'fixed bottom-20 right-4'
                        : 'absolute top-full mt-2 right-0'
                "
            >
                <div
                    class="px-4 py-3 border-b border-border-color bg-slate-900/60 flex items-center gap-2"
                >
                    <Icon
                        name="mdi:account-circle"
                        class="text-accent-primary text-xl"
                    />
                    <span class="font-bold text-primary text-sm"
                        >Account Menu</span
                    >
                </div>

                <div class="flex flex-col p-2 gap-1">
                    <NuxtLink
                        to="/profile"
                        @click="isOpen = false"
                        class="flex items-center gap-3 p-2.5 rounded-lg text-secondary hover:text-primary hover:bg-slate-700/70 transition-colors text-sm font-medium"
                        active-class="bg-slate-700 text-primary"
                    >
                        <Icon
                            name="mdi:card-account-details-outline"
                            class="text-lg"
                        />
                        My Profile
                    </NuxtLink>

                    <NuxtLink
                        to="/friends"
                        @click="isOpen = false"
                        class="flex justify-between items-center p-2.5 rounded-lg text-secondary hover:text-primary hover:bg-slate-700/70 transition-colors text-sm font-medium"
                        active-class="bg-slate-700 text-primary"
                    >
                        <div class="flex items-center gap-3">
                            <Icon name="mdi:account-multiple" class="text-lg" />
                            Friends
                        </div>
                        <span
                            v-if="pendingRequestsCount > 0"
                            class="bg-mtg-red text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg"
                        >
                            {{ pendingRequestsCount }}
                        </span>
                    </NuxtLink>
                </div>

                <div class="p-2 border-t border-border-color bg-slate-900/60">
                    <button
                        @click="handleSignOut"
                        class="flex w-full items-center gap-3 p-2.5 rounded-lg text-mtg-red hover:bg-red-950/40 transition-colors font-medium text-sm"
                    >
                        <Icon name="mdi:logout" class="text-lg" />
                        Sign Out
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";

const db = useDb();
const user = useSupabaseUser();

const props = defineProps({
    iconName: {
        type: String,
        default: "mdi:menu",
    },
    showLabel: {
        type: Boolean,
        default: false,
    },
    customClass: {
        type: String,
        default: "",
    },
    menuAnchor: {
        type: String,
        default: "top", // "top" or "bottom"
    },
});

const emit = defineEmits(["signOut"]);
const isOpen = ref(false);
const router = useRouter();
const pendingRequestsCount = ref(0);

// Fetch count initially and optionally setup subscription or simple refresh
const updatePendingCount = async () => {
    if (user.value) {
        pendingRequestsCount.value = await db.getPendingIncomingRequestsCount();
    }
};

// Close menu on route change
const closeMenu = () => {
    isOpen.value = false;
};

onMounted(() => {
    router.afterEach(closeMenu);
    updatePendingCount();
});

watch(
    user,
    (newUser) => {
        if (newUser) updatePendingCount();
    },
    { immediate: true },
);

onUnmounted(() => {
    isOpen.value = false;
});

const handleSignOut = () => {
    isOpen.value = false;
    emit("signOut");
};
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
}
</style>
