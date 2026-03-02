<template>
    <div class="animate-fade-in text-primary h-full">
        <div v-if="isLoading" class="flex justify-center items-center h-64">
            <Icon
                name="mdi:loading"
                class="animate-spin text-5xl text-accent-primary"
            />
        </div>

        <div v-else-if="player">
            <!-- Back Navigation -->
            <div class="mb-4">
                <NuxtLink
                    to="/players"
                    class="inline-flex items-center gap-2 text-secondary hover:text-accent-primary transition-colors font-medium"
                >
                    <Icon name="mdi:arrow-left" class="text-xl" /> Back to
                    Players
                </NuxtLink>
            </div>

            <!-- Page Header -->
            <PageHeader
                :title="player.name"
                label="Player Profile"
                :description="`Joined the playgroup on ${new Date(player.created_at).toLocaleDateString()}`"
                icon="mdi:account-details-outline"
            />

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
                        Career Overview
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

                <!-- Most Played Decks -->
                <div class="card p-6 lg:col-span-1">
                    <h3
                        class="text-xl font-bold mb-4 border-b border-border-color pb-2 flex items-center gap-2"
                    >
                        <Icon
                            name="mdi:cards-outline"
                            class="text-accent-primary text-2xl"
                        />
                        Top Decks Used
                    </h3>
                    <div class="h-56 flex justify-center items-center w-full">
                        <Bar
                            v-if="deckChartData.labels?.length"
                            :data="deckChartData"
                            :options="barChartOptions"
                        />
                        <div
                            v-else
                            class="text-muted flex flex-col items-center"
                        >
                            <Icon
                                name="mdi:cards-playing-outline"
                                class="text-4xl mb-2 opacity-50"
                            />
                            <p>No decks recorded yet</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Games History -->
            <div class="card p-6">
                <h3
                    class="text-xl font-bold mb-4 border-b border-border-color pb-2 flex items-center gap-2"
                >
                    <Icon
                        name="mdi:history"
                        class="text-accent-primary text-2xl"
                    />
                    Recent Games
                </h3>

                <div v-if="games.length > 0" class="flex flex-col gap-4">
                    <GameHistoryItem
                        v-for="game in games.slice(0, 3)"
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
                    class="text-center p-8 text-muted border border-border-color rounded-md bg-bg-secondary/50"
                >
                    <Icon name="mdi:history" class="text-5xl mb-3 opacity-50" />
                    <p>No game history found for this player.</p>
                </div>
            </div>
        </div>

        <div
            v-else
            class="flex flex-col items-center justify-center h-64 text-center"
        >
            <Icon name="mdi:account-cancel" class="text-6xl text-muted mb-4" />
            <h2 class="text-2xl font-bold text-primary mb-2">
                Player Not Found
            </h2>
            <p class="text-secondary mb-6">
                The player you are looking for might have been removed or
                doesn't exist.
            </p>
            <NuxtLink
                to="/players"
                class="btn-primary inline-flex items-center gap-2 px-6 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover transition-colors font-semibold shadow-lg"
            >
                <Icon name="mdi:arrow-left" /> Back to Directory
            </NuxtLink>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
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
const playerId = route.params.id;
const db = useDb();

const player = ref(null);
const games = ref([]);
const isLoading = ref(true);

const totalGames = computed(() => games.value.length);
const totalWins = computed(
    () => games.value.filter((g) => g.winner_id === playerId).length,
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

// Most Played Decks Bar Chart
const deckChartData = computed(() => {
    const deckCounts = {};
    games.value.forEach((g) => {
        const participant = g.game_participants?.find(
            (p) => p.player_id === playerId,
        );
        if (participant?.decks) {
            const deckName = participant.decks.commander_name || "Unknown Deck";
            deckCounts[deckName] = (deckCounts[deckName] || 0) + 1;
        }
    });

    // Sort by most played and take top 4
    const sortedDecks = Object.entries(deckCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    return {
        labels: sortedDecks.map((d) => {
            // Truncate long names slightly if needed
            return d[0].length > 15 ? d[0].substring(0, 15) + "..." : d[0];
        }),
        datasets: [
            {
                label: "Matches Played",
                backgroundColor: "rgba(99, 102, 241, 0.85)", // accent-primary translucent
                hoverBackgroundColor: "rgba(99, 102, 241, 1)",
                borderRadius: 4,
                data: sortedDecks.map((d) => d[1]),
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

// --- Data Fetching ---

const loadData = async () => {
    isLoading.value = true;
    try {
        player.value = await db.getPlayerById(playerId);

        // Fetch all games to calculate stats - in a real huge DB, we'd do this backend side
        const allGames = await db.getGames();

        // Filter games this player was part of
        games.value = allGames.filter(
            (g) =>
                g.game_participants &&
                g.game_participants.some((p) => p.player_id === playerId),
        );
    } catch (error) {
        console.error("Failed to load player details", error);
        player.value = null;
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadData();
});
</script>
