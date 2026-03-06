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

            <!-- Chart Analytics -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- Win Distribution -->
                <div class="card p-6 flex flex-col">
                    <h3
                        class="text-xl font-bold mb-4 border-b border-border-color pb-2 flex items-center gap-2"
                    >
                        <Icon
                            name="mdi:chart-arc"
                            class="text-accent-primary text-2xl"
                        />
                        Overall Win Distribution
                    </h3>
                    <div
                        class="relative h-64 flex justify-center items-center w-full grow"
                    >
                        <template v-if="winChartData">
                            <Doughnut
                                :data="winChartData"
                                :options="doughnutOptions"
                            />
                        </template>
                        <div
                            v-else
                            class="text-muted flex flex-col items-center"
                        >
                            <Icon
                                name="mdi:chart-pie-outline"
                                class="text-4xl mb-2 opacity-50"
                            />
                            <p>Not enough game data yet</p>
                        </div>
                    </div>
                </div>

                <!-- Top Decks -->
                <div class="card p-6 flex flex-col">
                    <h3
                        class="text-xl font-bold mb-4 border-b border-border-color pb-2 flex items-center gap-2"
                    >
                        <Icon
                            name="mdi:cards-outline"
                            class="text-emerald-500 text-2xl"
                        />
                        Most Winning Decks
                    </h3>
                    <div
                        class="h-64 flex justify-center items-center w-full grow"
                    >
                        <template
                            v-if="deckMetaData?.datasets?.[0]?.data?.length > 0"
                        >
                            <Bar :data="deckMetaData" :options="barOptions" />
                        </template>
                        <div
                            v-else
                            class="text-muted flex flex-col items-center"
                        >
                            <Icon
                                name="mdi:cards-playing-outline"
                                class="text-4xl mb-2 opacity-50"
                            />
                            <p>Not enough deck data yet</p>
                        </div>
                    </div>
                </div>
            </div>

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
import { ref, onMounted, computed } from "vue";
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

const db = useDb();
const isLoading = ref(true);
const leaderboardRef = ref(null);

const metrics = ref({
    totalPlayers: 0,
    totalDecks: 0,
    totalGames: 0,
});

const recentGames = ref([]);
const allGames = ref([]);
const allPlayers = ref([]);

const CHART_COLORS = [
    "#6366f1", // Indigo 500 (Theme Accent)
    "#10b981", // Emerald 500 (Wins highlight)
    "#8b5cf6", // Violet 500
    "#0ea5e9", // Sky 500
    "#f59e0b", // Amber 500 (Trophy highlight)
    "#14b8a6", // Teal 500
    "#3b82f6", // Blue 500
    "#475569", // Slate 600
];

// --- Overall Win Distribution (Doughnut) ---
const winChartData = computed(() => {
    const winCounts = {};
    allGames.value.forEach((g) => {
        if (g.winner_id) {
            winCounts[g.winner_id] = (winCounts[g.winner_id] || 0) + 1;
        }
    });

    const entries = Object.entries(winCounts).sort((a, b) => b[1] - a[1]);
    const labels = [];
    const data = [];
    const bgColors = [];
    const hoverBgColors = [];

    entries.forEach(([playerId, wins], index) => {
        const p = allPlayers.value.find((p) => p.id === playerId);
        labels.push(p ? p.name : "Unknown");
        data.push(wins);

        const colorHue = CHART_COLORS[index % CHART_COLORS.length];
        bgColors.push(`${colorHue}cc`); // 80% opacity
        hoverBgColors.push(`${colorHue}ff`); // 100% opacity
    });

    if (data.length === 0) return null;

    return {
        labels,
        datasets: [
            {
                backgroundColor: bgColors,
                hoverBackgroundColor: hoverBgColors,
                borderColor: "#0f172a",
                borderWidth: 2,
                data,
                cutout: "60%",
            },
        ],
    };
});

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: "right",
            labels: {
                color: "#cbd5e1",
                font: { family: "'Inter', sans-serif" },
                boxWidth: 12,
            },
        },
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

// --- Top Decks Meta (Bar) ---
const deckMetaData = computed(() => {
    const deckWins = {};
    allGames.value.forEach((g) => {
        if (g.winner_id) {
            const winnerParticipant = g.game_participants?.find(
                (p) => p.player_id === g.winner_id,
            );
            if (winnerParticipant?.decks) {
                const deckName =
                    winnerParticipant.decks.commander_name || "Unknown Deck";
                deckWins[deckName] = (deckWins[deckName] || 0) + 1;
            }
        }
    });

    const entries = Object.entries(deckWins)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // display top 5

    return {
        labels: entries.map((e) =>
            e[0].length > 18 ? e[0].substring(0, 18) + "..." : e[0],
        ),
        datasets: [
            {
                label: "Total Wins",
                backgroundColor: "rgba(16, 185, 129, 0.8)", // emerald-500
                hoverBackgroundColor: "rgba(16, 185, 129, 1)",
                borderRadius: 4,
                data: entries.map((e) => e[1]),
            },
        ],
    };
});

const barOptions = {
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

const loadData = async () => {
    isLoading.value = true;
    try {
        const [players, decks, games] = await Promise.all([
            db.getPlayers(),
            db.getDecks(),
            db.getGames({ involvedOnly: true }),
        ]);

        metrics.value.totalPlayers = players.length;
        metrics.value.totalDecks = decks.length;
        metrics.value.totalGames = games.length;

        allGames.value = games;
        allPlayers.value = players;
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
