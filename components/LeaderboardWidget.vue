<template>
    <div class="card flex flex-col">
        <div
            class="flex items-center justify-between cursor-pointer border-b border-border-color pb-2 mb-4 group"
            @click="isExpanded = !isExpanded"
        >
            <h3
                class="text-xl flex items-center gap-2 m-0 border-none transition-colors group-hover:text-amber-400"
            >
                <span>Top Players</span>
                <Icon name="mdi:trophy" class="text-amber-400 text-2xl" />
            </h3>
            <Icon
                :name="isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'"
                class="text-muted text-2xl transition-transform group-hover:text-amber-400"
            />
        </div>

        <div
            v-show="isExpanded"
            class="animate-fade-in flex flex-col flex-grow"
        >
            <div
                v-if="isLoading"
                class="flex justify-center p-6 text-muted border border-border-color rounded-md"
            >
                <Icon name="mdi:loading" class="animate-spin text-3xl" />
            </div>

            <div
                v-else-if="leaderboard.length > 0"
                class="flex flex-col gap-3 pb-2 flex-grow"
            >
                <NuxtLink
                    v-for="(player, index) in leaderboard"
                    :key="player.id"
                    :to="`/players/${player.id}`"
                    class="flex items-center justify-between bg-bg-secondary p-3 rounded-md border border-white/5 transition-colors hover:bg-tertiary cursor-pointer"
                    :class="{
                        'ring-1 ring-amber-400/50 bg-amber-400/5': index === 0,
                    }"
                >
                    <div class="flex items-center gap-3">
                        <div
                            class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm"
                            :class="
                                index === 0
                                    ? 'bg-amber-400 text-amber-950'
                                    : index === 1
                                      ? 'bg-slate-300 text-slate-900'
                                      : index === 2
                                        ? 'bg-amber-700 text-white'
                                        : 'bg-tertiary text-muted border border-border-color'
                            "
                        >
                            {{ index + 1 }}
                        </div>
                        <span
                            class="font-medium text-text-primary"
                            :class="{ 'text-amber-400 font-bold': index === 0 }"
                        >
                            <PlayerName :player="player" />
                        </span>
                    </div>
                    <div
                        class="flex items-center gap-1.5 bg-tertiary px-3 py-1 rounded-full text-sm border border-border-color"
                    >
                        <span class="font-bold text-accent-primary">{{
                            player.wins
                        }}</span>
                        <span
                            class="text-muted text-xs uppercase tracking-wider"
                            >Wins</span
                        >
                    </div>
                </NuxtLink>
            </div>

            <div
                v-else
                class="flex flex-col items-center justify-center p-8 text-center text-muted flex-grow border border-border-color rounded-md"
            >
                <Icon
                    name="mdi:account-group"
                    class="text-4xl mb-3 opacity-50"
                />
                <p class="text-sm">No wins recorded yet.</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const db = useDb();
const isExpanded = ref(true);
const isLoading = ref(true);
const leaderboard = ref([]);

const fetchData = async () => {
    isLoading.value = true;
    try {
        const [players, games] = await Promise.all([
            db.getPlayers(),
            db.getGames({ involvedOnly: true }),
        ]);

        const winCounts = {};
        games.forEach((game) => {
            if (game.winner_id) {
                winCounts[game.winner_id] =
                    (winCounts[game.winner_id] || 0) + 1;
            }
        });

        leaderboard.value = Object.entries(winCounts)
            .map(([playerId, wins]) => {
                const player = players.find((p) => p.id === playerId);
                return {
                    ...player,
                    id: playerId,
                    name: player ? player.name : "Unknown Player",
                    wins,
                };
            })
            .sort((a, b) => b.wins - a.wins)
            .slice(0, 5);
    } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchData();
});
</script>
