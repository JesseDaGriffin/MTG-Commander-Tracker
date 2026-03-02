<template>
    <div class="animate-fade-in">
        <!-- Dashboard Banner -->
        <div
            class="relative overflow-hidden bg-tertiary border border-border-color rounded-xl p-6 sm:p-10 mb-8 flex items-center justify-between shadow-lg"
        >
            <!-- Background watermark -->
            <img
                src="/favicon.png"
                alt=""
                class="absolute -right-10 -bottom-20 w-80 h-80 opacity-5 blur-md pointer-events-none mix-blend-screen"
                aria-hidden="true"
            />

            <div class="relative z-10 w-full sm:w-2/3">
                <span
                    class="inline-block px-3 py-1 bg-accent-primary/10 text-accent-primary text-xs font-semibold rounded-full mb-3 border border-accent-primary/20"
                >
                    Arcane Ledger
                </span>
                <h2
                    class="text-3xl sm:text-4xl font-extrabold mb-2 text-white tracking-tight"
                >
                    Dashboard
                </h2>
                <p class="text-muted text-base sm:text-lg max-w-lg">
                    Overview of your Commander games, player statistics, and
                    recent battle history.
                </p>
            </div>

            <!-- Prominent Logo -->
            <div class="hidden sm:block relative z-10 shrink-0 pr-4">
                <div
                    class="absolute inset-0 bg-accent-primary/20 blur-2xl rounded-full scale-150"
                ></div>
                <img
                    src="/favicon.png"
                    alt="Arcane Ledger Logo"
                    class="relative w-28 h-28 object-contain drop-shadow-2xl transform -rotate-6 transition-transform hover:rotate-0 hover:scale-105 duration-500"
                />
            </div>
        </div>

        <div v-if="isLoading" class="text-center p-6 text-muted">
            <Icon name="mdi:loading" class="animate-spin text-5xl" />
        </div>

        <div v-else>
            <!-- Quick Record Action -->
            <div class="mb-6 flex justify-end">
                <BaseButton to="/games?action=record" icon="mdi:sword-cross">
                    Record New Game
                </BaseButton>
            </div>

            <!-- Leaderboard -->
            <LeaderboardWidget class="mb-8" ref="leaderboardRef" />

            <!-- Recent Games -->
            <div class="card mt-6">
                <h3 class="text-xl mb-4 border-b border-border-color pb-2">
                    Recent Games
                </h3>

                <div
                    v-if="recentGames.length > 0"
                    class="flex flex-col gap-4 pb-2"
                >
                    <GameHistoryItem
                        v-for="game in recentGames"
                        :key="game.id"
                        :game="game"
                    />
                    <BaseButton
                        to="/games"
                        variant="secondary"
                        customClass="mt-4 w-full flex justify-center"
                    >
                        View All Games and Details
                    </BaseButton>
                </div>

                <div
                    v-else
                    class="flex flex-col items-center justify-center p-12 text-center text-muted"
                >
                    <Icon name="mdi:inbox" class="text-5xl mb-4 opacity-50" />
                    <p>No games recorded yet. Start playing!</p>
                    <NuxtLink
                        to="/games?action=record"
                        class="btn btn-primary mt-6"
                        >Record Game</NuxtLink
                    >
                </div>
            </div>

            <div
                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8"
            >
                <NuxtLink
                    to="/players"
                    class="card flex items-center gap-5 p-6 border-l-4 border-l-accent-primary hover:bg-tertiary transition-colors cursor-pointer group"
                >
                    <Icon
                        name="mdi:account-group"
                        class="text-4xl text-accent-primary bg-indigo-500/10 p-2 rounded-md group-hover:bg-accent-primary/20 transition-colors"
                    />
                    <div>
                        <h3 class="text-sm text-secondary font-medium mb-1">
                            Total Players
                        </h3>
                        <p
                            class="text-2xl font-bold text-primary group-hover:text-accent-primary transition-colors"
                        >
                            {{ metrics.totalPlayers }}
                        </p>
                    </div>
                </NuxtLink>
                <NuxtLink
                    to="/decks"
                    class="card flex items-center gap-5 p-6 border-l-4 border-l-accent-primary hover:bg-tertiary transition-colors cursor-pointer group"
                >
                    <Icon
                        name="mdi:cards"
                        class="text-4xl text-accent-primary bg-indigo-500/10 p-2 rounded-md group-hover:bg-accent-primary/20 transition-colors"
                    />
                    <div>
                        <h3 class="text-sm text-secondary font-medium mb-1">
                            Total Decks
                        </h3>
                        <p
                            class="text-2xl font-bold text-primary group-hover:text-accent-primary transition-colors"
                        >
                            {{ metrics.totalDecks }}
                        </p>
                    </div>
                </NuxtLink>
                <NuxtLink
                    to="/games"
                    class="card flex items-center gap-5 p-6 border-l-4 border-l-accent-primary hover:bg-tertiary transition-colors cursor-pointer group"
                >
                    <Icon
                        name="mdi:sword-cross"
                        class="text-4xl text-accent-primary bg-indigo-500/10 p-2 rounded-md group-hover:bg-accent-primary/20 transition-colors"
                    />
                    <div>
                        <h3 class="text-sm text-secondary font-medium mb-1">
                            Games Played
                        </h3>
                        <p
                            class="text-2xl font-bold text-primary group-hover:text-accent-primary transition-colors"
                        >
                            {{ metrics.totalGames }}
                        </p>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const db = useDb();
const isLoading = ref(true);
const leaderboardRef = ref(null);

const metrics = ref({
    totalPlayers: 0,
    totalDecks: 0,
    totalGames: 0,
});

const recentGames = ref([]);

const loadData = async () => {
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
};

onMounted(() => {
    loadData();
});
</script>
