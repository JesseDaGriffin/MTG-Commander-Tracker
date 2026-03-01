<template>
    <div class="animate-fade-in">
        <!-- Header Banner -->
        <PageHeader
            title="Games"
            label="Match History"
            description="Record new game results and view history."
            icon="mdi:sword-cross"
        />

        <!-- Record Game Form -->
        <div v-show="showAddForm" class="mb-6 animate-fade-in">
            <RecordGameForm
                @saved="onGameSaved"
                @cancel="showAddForm = false"
            />
        </div>

        <!-- Game History -->
        <div class="card p-6">
            <div
                class="flex items-center justify-between border-b border-border-color pb-4 mb-4"
            >
                <h3 class="text-xl font-bold">Game History</h3>
                <button
                    v-if="!showAddForm"
                    class="btn btn-primary"
                    @click="showAddForm = true"
                >
                    <Icon name="mdi:sword-cross" class="mr-2" />
                    Record Game
                </button>
            </div>

            <div v-if="isLoading" class="flex justify-center p-6 text-muted">
                <Icon name="mdi:loading" class="animate-spin text-5xl" />
            </div>

            <div v-else-if="games.length > 0" class="flex flex-col gap-4">
                <GameHistoryItem
                    v-for="game in games"
                    :key="game.id"
                    :game="game"
                    @updated="loadData"
                />
            </div>

            <div
                v-else
                class="flex flex-col items-center justify-center p-12 text-center text-muted"
            >
                <Icon name="mdi:history" class="text-5xl mb-4 opacity-50" />
                <p>No games recorded yet.</p>
                <button
                    v-if="!showAddForm"
                    class="btn btn-primary mt-6"
                    @click="showAddForm = true"
                >
                    Record Your First Game
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const db = useDb();
const route = useRoute();

const games = ref([]);
const isLoading = ref(true);
const showAddForm = ref(false);

const loadData = async () => {
    isLoading.value = true;
    try {
        games.value = await db.getGames();
    } catch (error) {
        console.error("Failed to load games data:", error);
    } finally {
        isLoading.value = false;
    }
};

const onGameSaved = () => {
    showAddForm.value = false;
    loadData();
};

onMounted(() => {
    loadData();
    if (route.query.action === "record") {
        showAddForm.value = true;
    }
});
</script>
