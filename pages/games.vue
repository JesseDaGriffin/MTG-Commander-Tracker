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
                <BaseButton
                    v-if="!showAddForm"
                    variant="primary"
                    @click="showAddForm = true"
                    icon="mdi:sword-cross"
                >
                    Record Game
                </BaseButton>
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
                class="flex flex-col items-center justify-center p-12 text-center text-muted"
            >
                <Icon name="mdi:history" class="text-5xl mb-4 opacity-50" />
                <p>No games recorded yet.</p>
                <BaseButton
                    v-if="!showAddForm"
                    variant="primary"
                    customClass="mt-6"
                    @click="showAddForm = true"
                >
                    Record Your First Game
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRoute } from "vue-router";
import { useDb } from "~/composables/useDb";

const db = useDb();
const route = useRoute();

const games = ref([]);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const showAddForm = ref(false);

const loadMoreTrigger = ref(null);
let observer = null;

const currentPage = ref(1);
const pageSize = ref(5);
const totalGames = ref(0);

const hasMore = computed(() => games.value.length < totalGames.value);

const allGames = ref([]);

const loadData = async () => {
    isLoading.value = true;
    currentPage.value = 1;
    try {
        allGames.value = await db.getGames({ involvedOnly: true });

        totalGames.value = allGames.value.length;
        games.value = allGames.value.slice(0, pageSize.value);

        setupObserver();
    } catch (error) {
        console.error("Failed to load games data:", error);
    } finally {
        isLoading.value = false;
    }
};

const loadMore = async () => {
    if (isLoadingMore.value || !hasMore.value) return;

    isLoadingMore.value = true;

    // Simulate slight network delay for smoother UI feedback
    setTimeout(() => {
        currentPage.value++;
        const endIndex = currentPage.value * pageSize.value;
        games.value = allGames.value.slice(0, endIndex);
        isLoadingMore.value = false;
    }, 300);
};

const setupObserver = () => {
    // Need a slight delay to ensure DOM is updated before observing
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
        ); // Trigger a bit before they hit the very bottom

        observer.observe(loadMoreTrigger.value);
    }, 100);
};

onBeforeUnmount(() => {
    if (observer) observer.disconnect();
});

const onGameSaved = () => {
    showAddForm.value = false;
    // Reload first page completely
    loadData();
};

onMounted(() => {
    loadData();
    if (route.query.action === "record") {
        showAddForm.value = true;
    }
});
</script>
