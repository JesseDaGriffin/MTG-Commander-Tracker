<template>
    <div class="animate-fade-in">
        <!-- Header Banner -->
        <PageHeader
            title="Decks"
            label="Armory"
            description="Manage Commander decks for each player."
            icon="mdi:cards"
        />

        <div class="card p-6 mb-8 relative z-20">
            <h3 class="text-xl font-bold mb-4">Add New Deck</h3>

            <div class="mb-5">
                <label
                    class="block text-sm font-medium text-secondary mb-2"
                    for="playerSelect"
                    >Select Player</label
                >
                <BaseSelect
                    id="playerSelect"
                    v-model="selectedPlayerId"
                    :disabled="isLoading"
                    placeholder="-- Choose a Player --"
                    :options="
                        players.map((player) => ({
                            label: player.name,
                            value: player.id,
                            icon: player._is_you
                                ? 'mdi:account'
                                : player._is_friend
                                  ? 'mdi:account-heart'
                                  : null,
                            iconClass: player._is_you
                                ? 'text-accent-primary'
                                : player._is_friend
                                  ? 'text-mtg-red'
                                  : '',
                        }))
                    "
                />
            </div>

            <div class="mb-2">
                <label class="block text-sm font-medium text-secondary mb-2"
                    >Find Commander</label
                >
                <CommanderSearch
                    ref="commanderSearchRef"
                    @select="onCommanderSelect"
                />
            </div>

            <div
                v-if="selectedCommander"
                class="mt-6 border border-border-color rounded-md p-4 bg-tertiary"
            >
                <div
                    class="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left"
                >
                    <img
                        v-if="selectedCommander.imageUrl"
                        :src="selectedCommander.imageUrl"
                        :alt="selectedCommander.name"
                        class="w-32 rounded-lg shadow-md cursor-pointer hover:shadow-glow hover:ring-2 hover:ring-accent-primary transition-all"
                        @click="onSelectedCommanderPreviewClick"
                    />
                    <div class="flex-1">
                        <h4 class="text-lg font-bold text-primary">
                            {{ selectedCommander.name }}
                        </h4>
                        <p class="text-sm text-muted mb-4">
                            Selected Commander
                        </p>
                        <BaseButton
                            variant="primary"
                            @click="saveDeck"
                            :disabled="isSubmitting || !selectedPlayerId"
                            :loading="isSubmitting"
                        >
                            Save Deck
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>

        <div class="card p-6">
            <div
                class="flex items-center justify-between border-b border-border-color pb-4 mb-6 gap-4"
            >
                <h3 class="text-xl font-bold">Deck Roster</h3>
                <div class="relative w-full max-w-xs">
                    <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10"
                    >
                        <Icon name="mdi:magnify" class="text-muted" />
                    </div>
                    <BaseInput
                        v-model="playerSearchQuery"
                        type="text"
                        placeholder="Search players..."
                        class="pl-10"
                    />
                </div>
            </div>

            <div v-if="isLoading" class="flex justify-center p-6 text-muted">
                <Icon name="mdi:loading" class="animate-spin text-5xl" />
            </div>

            <div
                v-else-if="Object.keys(groupedDecks).length > 0"
                class="flex flex-col gap-8"
            >
                <div
                    v-for="(playerDecks, playerId) in groupedDecks"
                    :key="playerId"
                    class="player-group"
                >
                    <h4
                        class="text-lg font-bold text-secondary mb-4 border-b border-border-color pb-1 flex items-center gap-1 w-fit"
                    >
                        <PlayerName
                            :player="getPlayerObjById(playerId)"
                            suffix="'s"
                            iconPosition="left"
                        />
                        Decks
                    </h4>

                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        <DeckCard
                            v-for="deck in playerDecks"
                            :key="deck.id"
                            :deck="deck"
                            @preview="openPreview"
                        />
                    </div>
                </div>
            </div>

            <div
                v-else
                class="flex flex-col items-center justify-center p-12 text-center text-muted"
            >
                <Icon
                    name="mdi:cards-outline"
                    class="text-5xl mb-4 opacity-50"
                />
                <p v-if="playerSearchQuery">
                    No players found matching "{{ playerSearchQuery }}".
                </p>
                <p v-else>No decks added yet.</p>
            </div>
        </div>

        <CardPreview
            :is-open="previewState.isOpen"
            :image-url="previewState.url"
            :origin-rect="previewState.rect"
            @close="previewState.isOpen = false"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const db = useDb();

const selectedCommander = ref(null);
const players = ref([]);
const selectedPlayerId = ref("");
const isSubmitting = ref(false);
const decks = ref([]);
const isLoading = ref(true);
const commanderSearchRef = ref(null);
const playerSearchQuery = ref("");

const previewState = ref({
    isOpen: false,
    url: "",
    rect: null,
});

const openPreview = ({ url, rect }) => {
    previewState.value = {
        isOpen: true,
        url,
        rect,
    };
};

const onSelectedCommanderPreviewClick = (e) => {
    if (!selectedCommander.value?.imageUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    openPreview({ url: selectedCommander.value.imageUrl, rect });
};

const groupedDecks = computed(() => {
    const groups = {};
    const query = playerSearchQuery.value.toLowerCase().trim();

    // Sort decks by commander name first
    const sortedDecks = [...decks.value].sort((a, b) =>
        a.commander_name.localeCompare(b.commander_name),
    );

    sortedDecks.forEach((deck) => {
        // Skip decks if the owner was soft-deleted
        const activePlayer = players.value.find((p) => p.id === deck.player_id);
        if (!activePlayer) return;

        const playerName = activePlayer.name;

        const playerId = activePlayer.id;

        if (query && !playerName.toLowerCase().includes(query)) {
            return;
        }

        if (!groups[playerId]) {
            groups[playerId] = [];
        }
        groups[playerId].push(deck);
    });

    // Sort the grouped object keys by: Me first, Friends second, Alphabetical third
    const sortedGroups = {};
    Object.keys(groups)
        .sort((a, b) => {
            const playerA = players.value.find((p) => p.id === a);
            const playerB = players.value.find((p) => p.id === b);

            const isYouA = playerA?._is_you ? 1 : 0;
            const isYouB = playerB?._is_you ? 1 : 0;
            if (isYouA !== isYouB) return isYouB - isYouA;

            const isFriendA = playerA?._is_friend ? 1 : 0;
            const isFriendB = playerB?._is_friend ? 1 : 0;
            if (isFriendA !== isFriendB) return isFriendB - isFriendA;

            const nameA = playerA ? playerA.name || "" : "";
            const nameB = playerB ? playerB.name || "" : "";
            return nameA.localeCompare(nameB, undefined, {
                sensitivity: "base",
            });
        })
        .forEach((key) => {
            sortedGroups[key] = groups[key];
        });

    return sortedGroups;
});

const getPlayerObjById = (playerId) => {
    return players.value.find((p) => p.id === playerId) || { name: "Unknown" };
};

const loadInitialData = async () => {
    isLoading.value = true;
    try {
        const [playersData, decksData] = await Promise.all([
            db.getPlayers(),
            db.getDecks(),
        ]);
        players.value = playersData;
        decks.value = decksData;
    } catch (error) {
        console.error("Failed to load data:", error);
    } finally {
        isLoading.value = false;
    }
};

const onCommanderSelect = (commander) => {
    selectedCommander.value = commander;
};

const saveDeck = async () => {
    if (!selectedPlayerId.value) {
        alert("Please select a player for this deck.");
        return;
    }

    isSubmitting.value = true;
    try {
        await db.addDeck(
            selectedPlayerId.value,
            selectedCommander.value.name,
            selectedCommander.value.imageUrl,
        );
        selectedCommander.value = null;
        selectedPlayerId.value = "";
        if (commanderSearchRef.value) {
            commanderSearchRef.value.clearSearch();
        }
        await loadInitialData();
    } catch (error) {
        console.error("Error saving deck:", error);
        alert("Failed to save deck.");
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
    loadInitialData();
});
</script>
