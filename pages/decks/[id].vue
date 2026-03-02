<template>
    <div class="animate-fade-in text-primary h-full">
        <div v-if="isLoading" class="flex justify-center items-center h-64">
            <Icon
                name="mdi:loading"
                class="animate-spin text-5xl text-accent-primary"
            />
        </div>

        <div v-else-if="deck">
            <!-- Back Navigation -->
            <div class="mb-4">
                <NuxtLink
                    to="/decks"
                    class="inline-flex items-center gap-2 text-secondary hover:text-accent-primary transition-colors font-medium"
                >
                    <Icon name="mdi:arrow-left" class="text-xl" /> Back to Decks
                </NuxtLink>
            </div>

            <!-- Page Header -->
            <PageHeader
                :title="deck.commander_name"
                :label="deck.players?.name + '\'s Deck'"
                :description="`Added to Armory on ${new Date(deck.created_at).toLocaleDateString()}`"
                icon="mdi:cards-playing-outline"
                :image="deck.commander_image_url"
            />

            <!-- Rest of content similar to player page but scoped to deck -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <!-- Overview Stats -->
                <div
                    class="card p-6 border-t-4 border-t-indigo-500 lg:col-span-1 flex flex-col justify-center"
                >
                    <h3
                        class="text-xl font-bold mb-6 border-b border-border-color pb-2 flex items-center gap-2"
                    >
                        <Icon
                            name="mdi:chart-box"
                            class="text-indigo-500 text-2xl"
                        />
                        Performance Overview
                    </h3>

                    <div class="grid grid-cols-2 gap-4">
                        <div
                            class="bg-tertiary p-4 rounded-xl border border-border-color text-center shadow-inner hover:border-indigo-500/50 transition-colors"
                        >
                            <div
                                class="text-3xl font-black text-indigo-400 mb-1"
                            >
                                {{ totalGames }}
                            </div>
                            <div
                                class="text-xs text-secondary font-bold uppercase tracking-wider"
                            >
                                Games
                            </div>
                        </div>
                        <div
                            class="bg-tertiary p-4 rounded-xl border border-border-color text-center shadow-inner hover:border-green-500/50 transition-colors"
                        >
                            <div
                                class="text-3xl font-black text-green-400 mb-1"
                            >
                                {{ totalWins }}
                            </div>
                            <div
                                class="text-xs text-secondary font-bold uppercase tracking-wider"
                            >
                                Wins
                            </div>
                        </div>
                        <div
                            class="bg-tertiary p-4 rounded-xl border border-border-color text-center shadow-inner col-span-2 hover:border-blue-500/50 transition-colors"
                        >
                            <div class="text-4xl font-black text-blue-400 mb-1">
                                {{ winRate }}%
                            </div>
                            <div
                                class="text-xs text-secondary font-bold uppercase tracking-wider"
                            >
                                Overall Win Rate
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Win/Loss Ratio -->
                <div class="card p-6 lg:col-span-1">
                    <h3
                        class="text-xl font-bold mb-4 border-b border-border-color pb-2 flex items-center gap-2"
                    >
                        <Icon
                            name="mdi:chart-arc"
                            class="text-accent-primary text-2xl"
                        />
                        Win / Loss Ratio
                    </h3>
                    <div class="relative h-56 flex justify-center items-center">
                        <template v-if="totalGames > 0">
                            <Doughnut
                                :data="winLossChartData"
                                :options="pieChartOptions"
                            />
                            <!-- Center Text -->
                            <div
                                class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                            >
                                <span class="text-2xl font-bold text-primary">{{
                                    totalGames
                                }}</span>
                                <span class="text-xs text-muted">Total</span>
                            </div>
                        </template>
                        <div
                            v-else
                            class="text-muted flex flex-col items-center"
                        >
                            <Icon
                                name="mdi:chart-pie-outline"
                                class="text-4xl mb-2 opacity-50"
                            />
                            <p>No games played yet</p>
                        </div>
                    </div>
                </div>

                <!-- Most Faced Commanders -->
                <div class="card p-6 lg:col-span-1">
                    <h3
                        class="text-xl font-bold mb-4 border-b border-border-color pb-2 flex items-center gap-2"
                    >
                        <Icon
                            name="mdi:account-group"
                            class="text-accent-primary text-2xl"
                        />
                        Top Opponents
                    </h3>
                    <div class="h-56 flex justify-center items-center w-full">
                        <Bar
                            v-if="opponentChartData.labels?.length"
                            :data="opponentChartData"
                            :options="barChartOptions"
                        />
                        <div
                            v-else
                            class="text-muted flex flex-col items-center"
                        >
                            <Icon
                                name="mdi:account-group-outline"
                                class="text-4xl mb-2 opacity-50"
                            />
                            <p>No opponents recorded yet</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Games History (Infinite Scroll) -->
            <div class="card p-6">
                <h3
                    class="text-xl font-bold mb-4 border-b border-border-color pb-2 flex items-center gap-2"
                >
                    <Icon
                        name="mdi:history"
                        class="text-accent-primary text-2xl"
                    />
                    Match History
                </h3>

                <div v-if="games.length > 0" class="flex flex-col gap-4">
                    <GameHistoryItem
                        v-for="game in games"
                        :key="game.id"
                        :game="game"
                    />

                    <!-- Infinite Scroll Trigger -->
                    <div ref="loadMoreTrigger" class="h-4 w-full"></div>

                    <!-- Loading More Status -->
                    <div
                        v-if="isLoadingMore"
                        class="flex justify-center p-4 text-muted"
                    >
                        <Icon
                            name="mdi:loading"
                            class="animate-spin text-3xl text-accent-primary"
                        />
                    </div>
                </div>
                <div
                    v-else
                    class="text-center p-8 text-muted border border-border-color rounded-md bg-bg-secondary/50"
                >
                    <Icon name="mdi:history" class="text-5xl mb-3 opacity-50" />
                    <p>No game history found for this deck.</p>
                </div>
            </div>
        </div>

        <div
            v-else
            class="flex flex-col items-center justify-center h-64 text-center"
        >
            <Icon name="mdi:cards-outline" class="text-6xl text-muted mb-4" />
            <h2 class="text-2xl font-bold text-primary mb-2">Deck Not Found</h2>
            <p class="text-secondary mb-6">
                The deck you are looking for might have been deleted or doesn't
                exist.
            </p>
            <NuxtLink
                to="/decks"
                class="btn-primary inline-flex items-center gap-2 px-6 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover transition-colors font-semibold shadow-lg"
            >
                <Icon name="mdi:arrow-left" /> Back to Armory
            </NuxtLink>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import { useDb } from "~/composables/useDb";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js";
import { Doughnut, Bar } from "vue-chartjs";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
);

const route = useRoute();
const deckId = route.params.id;
const db = useDb();

const deck = ref(null);
const games = ref([]); // all games filtered
const displayedGames = ref([]); // chunked games array for infinite scroll
const isLoading = ref(true);
const isLoadingMore = ref(false);

const loadMoreTrigger = ref(null);
let observer = null;

const currentPage = ref(1);
const pageSize = ref(10);
const allGamesFetched = ref(false);

const hasMore = computed(
    () => displayedGames.value.length < games.value.length,
);

// We need total stats computed from server ideally, but for now we filter all loaded games
// Note: for a huge dataset we'd need backend COUNT queries with filters in supabase
const totalGames = computed(() => games.value.length);
const totalWins = computed(
    () =>
        games.value.filter((g) => g.winner_id === deck.value?.player_id).length,
);
const winRate = computed(() =>
    totalGames.value > 0
        ? Math.round((totalWins.value / totalGames.value) * 100)
        : 0,
);
const totalLosses = computed(() => totalGames.value - totalWins.value);

// --- Chart setup ---

// Win / Loss Doughnut Chart
const winLossChartData = computed(() => ({
    labels: ["Wins", "Losses"],
    datasets: [
        {
            backgroundColor: ["#4ade80", "#f87171"], // green-400, red-400
            hoverBackgroundColor: ["#22c55e", "#ef4444"],
            borderColor: "#0f172a", // to match dark theme background
            borderWidth: 3,
            data: [totalWins.value, totalLosses.value],
            cutout: "70%", // Thin doughnut
        },
    ],
}));

const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "bottom",
            labels: {
                color: "#cbd5e1",
                padding: 20,
                font: { family: "'Inter', sans-serif", weight: "bold" },
            },
        },
        tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            titleColor: "#f8fafc",
            bodyColor: "#e2e8f0",
            borderColor: "#334155",
            borderWidth: 1,
            padding: 10,
            displayColors: true,
        },
    },
};

// Most Faced Opponents Bar Chart
const opponentChartData = computed(() => {
    const oppCounts = {};
    games.value.forEach((g) => {
        g.game_participants?.forEach((p) => {
            // Don't count the owner of this deck
            if (p.player_id !== deck.value?.player_id && p.players?.name) {
                oppCounts[p.players.name] =
                    (oppCounts[p.players.name] || 0) + 1;
            }
        });
    });

    // Sort by most played and take top 4
    const sortedOpps = Object.entries(oppCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    return {
        labels: sortedOpps.map((d) => {
            return d[0].length > 15 ? d[0].substring(0, 15) + "..." : d[0];
        }),
        datasets: [
            {
                label: "Matches Faced",
                backgroundColor: "rgba(244, 63, 94, 0.85)", // rose-500 translucent
                hoverBackgroundColor: "rgba(244, 63, 94, 1)",
                borderRadius: 4,
                data: sortedOpps.map((d) => d[1]),
            },
        ],
    };
});

const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1,
                color: "#94a3b8",
                font: { family: "'Inter', sans-serif" },
            },
            grid: { color: "#334155", tickColor: "transparent" },
            border: { display: false },
        },
        x: {
            ticks: {
                color: "#cbd5e1",
                font: { family: "'Inter', sans-serif", size: 10 },
            },
            grid: { display: false },
            border: { display: false },
        },
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            titleColor: "#f8fafc",
            bodyColor: "#e2e8f0",
            borderColor: "#334155",
            borderWidth: 1,
            padding: 10,
        },
    },
};

// --- Data Fetching & Infinite Scroll ---

const setupObserver = () => {
    setTimeout(() => {
        if (!loadMoreTrigger.value) return;

        if (observer) observer.disconnect();

        observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasMore.value &&
                    !isLoadingMore.value
                ) {
                    loadMore();
                }
            },
            { rootMargin: "150px" },
        );

        observer.observe(loadMoreTrigger.value);
    }, 100);
};

const loadMore = () => {
    if (isLoadingMore.value || !hasMore.value) return;

    isLoadingMore.value = true;

    setTimeout(() => {
        currentPage.value++;
        const endIndex = currentPage.value * pageSize.value;
        displayedGames.value = games.value.slice(0, endIndex);
        isLoadingMore.value = false;
    }, 300);
};

onBeforeUnmount(() => {
    if (observer) observer.disconnect();
});

const loadData = async () => {
    isLoading.value = true;
    currentPage.value = 1;
    try {
        deck.value = await db.getDeckById(deckId);

        // Fetch all games for stats visualization
        const allGames = await db.getGames();

        // Filter out games that this specific deck participated in
        games.value = allGames.filter(
            (g) =>
                g.game_participants &&
                g.game_participants.some((p) => p.deck_id === deckId),
        );

        displayedGames.value = games.value.slice(0, pageSize.value);
        setupObserver();
        allGamesFetched.value = true;
    } catch (error) {
        console.error("Failed to load deck details", error);
        deck.value = null;
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadData();
});
</script>
