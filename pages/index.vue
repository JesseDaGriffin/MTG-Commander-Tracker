<template>
    <div class="animate-fade-in">
        <div class="mb-8">
            <h2 class="text-3xl font-bold mb-1">Dashboard</h2>
            <p class="text-muted">Overview of your Arcane Ledger games</p>
        </div>

        <div v-if="isLoading" class="text-center p-6 text-muted">
            <Icon name="mdi:loading" class="animate-spin text-5xl" />
        </div>

        <div v-else>
            <div
                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8"
            >
                <div
                    class="card flex items-center gap-5 p-6 border-l-4 border-l-accent-primary"
                >
                    <Icon
                        name="mdi:account-group"
                        class="text-4xl text-accent-primary bg-indigo-500/10 p-2 rounded-md"
                    />
                    <div>
                        <h3 class="text-sm text-secondary font-medium mb-1">
                            Total Players
                        </h3>
                        <p class="text-2xl font-bold text-primary">
                            {{ metrics.totalPlayers }}
                        </p>
                    </div>
                </div>
                <div
                    class="card flex items-center gap-5 p-6 border-l-4 border-l-accent-primary"
                >
                    <Icon
                        name="mdi:cards"
                        class="text-4xl text-accent-primary bg-indigo-500/10 p-2 rounded-md"
                    />
                    <div>
                        <h3 class="text-sm text-secondary font-medium mb-1">
                            Total Decks
                        </h3>
                        <p class="text-2xl font-bold text-primary">
                            {{ metrics.totalDecks }}
                        </p>
                    </div>
                </div>
                <div
                    class="card flex items-center gap-5 p-6 border-l-4 border-l-accent-primary"
                >
                    <Icon
                        name="mdi:sword-cross"
                        class="text-4xl text-accent-primary bg-indigo-500/10 p-2 rounded-md"
                    />
                    <div>
                        <h3 class="text-sm text-secondary font-medium mb-1">
                            Games Played
                        </h3>
                        <p class="text-2xl font-bold text-primary">
                            {{ metrics.totalGames }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="card mt-6">
                <h3 class="text-xl mb-4 border-b border-border-color pb-2">
                    Recent Games
                </h3>

                <div
                    v-if="recentGames.length > 0"
                    class="flex flex-col gap-4 pb-2"
                >
                    <div
                        v-for="game in recentGames"
                        :key="game.id"
                        class="bg-tertiary rounded-md p-5 border-l-4 border-l-accent-primary"
                    >
                        <div class="text-xs text-muted mb-2">
                            {{ new Date(game.played_on).toLocaleDateString() }}
                        </div>
                        <div class="text-lg font-semibold flex items-center">
                            <span class="text-muted mr-2">Winner:</span>
                            <span class="text-mtg-red flex items-center gap-1">
                                <Icon name="mdi:crown" class="text-amber-400" />
                                {{ game.players?.name || "Draw" }}
                            </span>
                        </div>
                    </div>
                    <NuxtLink
                        to="/games"
                        class="btn btn-secondary mt-4 w-full flex justify-center"
                        >View All Games and Details</NuxtLink
                    >
                </div>

                <div
                    v-else
                    class="flex flex-col items-center justify-center p-12 text-center text-muted"
                >
                    <Icon name="mdi:inbox" class="text-5xl mb-4 opacity-50" />
                    <p>No games recorded yet. Start playing!</p>
                    <NuxtLink to="/games" class="btn btn-primary mt-6"
                        >Record Game</NuxtLink
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const db = useDb();
const isLoading = ref(true);

const metrics = ref({
    totalPlayers: 0,
    totalDecks: 0,
    totalGames: 0,
});

const recentGames = ref([]);

onMounted(async () => {
    isLoading.value = true;
    try {
        const [players, decks, games] = await Promise.all([
            db.getPlayers(),
            db.getDecks(),
            db.getGames(),
        ]);

        metrics.value.totalPlayers = players.length;
        metrics.value.totalDecks = decks.length;
        metrics.value.totalGames = games.length;

        // Get top 3 most recent games
        recentGames.value = games.slice(0, 3);
    } catch (error) {
        console.error("Failed to load dashboard metrics:", error);
    } finally {
        isLoading.value = false;
    }
});
</script>
