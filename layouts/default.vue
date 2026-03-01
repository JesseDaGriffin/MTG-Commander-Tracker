<template>
    <div class="flex flex-col min-h-screen">
        <!-- Desktop Header -->
        <header
            class="sticky top-0 z-50 border-b border-border-color bg-slate-800/70 backdrop-blur-md hidden md:block"
        >
            <div
                class="container mx-auto px-4 flex items-center justify-between h-16"
            >
                <div
                    class="flex items-center gap-3 text-primary group cursor-pointer"
                    @click="router.push('/')"
                >
                    <div class="relative">
                        <div
                            class="absolute inset-0 bg-accent-primary/50 blur-[8px] rounded-full scale-125 opacity-20 group-hover:opacity-100 transition-opacity duration-300"
                        ></div>
                        <img
                            src="/favicon.png"
                            alt="Arcane Ledger Logo"
                            class="relative w-8 h-8 rounded drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                    <h1
                        class="text-xl font-bold m-0 tracking-tight transition-colors duration-300 group-hover:text-white"
                    >
                        Arcane Ledger
                    </h1>
                </div>
                <nav class="flex gap-6 items-center">
                    <NuxtLink
                        to="/"
                        class="text-secondary font-medium text-[0.95rem] py-2 relative hover:text-primary transition-colors active-nav-link"
                        active-class="text-accent-primary router-link-active"
                        >Dashboard</NuxtLink
                    >
                    <NuxtLink
                        to="/players"
                        class="text-secondary font-medium text-[0.95rem] py-2 relative hover:text-primary transition-colors active-nav-link"
                        active-class="text-accent-primary router-link-active"
                        >Players</NuxtLink
                    >
                    <NuxtLink
                        to="/decks"
                        class="text-secondary font-medium text-[0.95rem] py-2 relative hover:text-primary transition-colors active-nav-link"
                        active-class="text-accent-primary router-link-active"
                        >Decks</NuxtLink
                    >
                    <NuxtLink
                        to="/games"
                        class="text-secondary font-medium text-[0.95rem] py-2 relative hover:text-primary transition-colors active-nav-link"
                        active-class="text-accent-primary router-link-active"
                        >Games</NuxtLink
                    >
                    <button
                        class="btn btn-secondary text-sm ml-4"
                        @click="signOut"
                    >
                        <Icon name="mdi:logout" class="mr-1" /> Sign Out
                    </button>
                </nav>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 py-6 md:py-10">
            <div class="container mx-auto px-4">
                <slot />
            </div>
        </main>

        <!-- Mobile Bottom Navigation -->
        <nav
            class="fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center border-t border-border-color bg-slate-800/70 backdrop-blur-md z-50 pb-[env(safe-area-inset-bottom)] md:hidden"
        >
            <NuxtLink
                to="/"
                class="flex flex-col items-center justify-center gap-1 text-secondary w-full h-full transition-colors hover:text-primary"
                active-class="!text-accent-primary"
            >
                <Icon name="mdi:view-dashboard" class="text-2xl" />
                <span class="text-[0.7rem] font-medium">Home</span>
            </NuxtLink>
            <NuxtLink
                to="/players"
                class="flex flex-col items-center justify-center gap-1 text-secondary w-full h-full transition-colors hover:text-primary"
                active-class="!text-accent-primary"
            >
                <Icon name="mdi:account-group" class="text-2xl" />
                <span class="text-[0.7rem] font-medium">Players</span>
            </NuxtLink>
            <NuxtLink
                to="/decks"
                class="flex flex-col items-center justify-center gap-1 text-secondary w-full h-full transition-colors hover:text-primary"
                active-class="!text-accent-primary"
            >
                <Icon name="mdi:cards" class="text-2xl" />
                <span class="text-[0.7rem] font-medium">Decks</span>
            </NuxtLink>
            <NuxtLink
                to="/games"
                class="flex flex-col items-center justify-center gap-1 text-secondary w-full h-full transition-colors hover:text-primary"
                active-class="!text-accent-primary"
            >
                <Icon name="mdi:sword-cross" class="text-2xl" />
                <span class="text-[0.7rem] font-medium">Games</span>
            </NuxtLink>
        </nav>
    </div>
</template>

<script setup>
const supabase = useSupabaseClient();
const router = useRouter();

const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
};
</script>

<style scoped>
.active-nav-link.router-link-active::after {
    content: "";
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--accent-primary);
    border-radius: 2px;
}
</style>
