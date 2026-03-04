<template>
    <div class="card p-6">
        <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b border-border-color pb-4 sm:border-none sm:pb-0"
        >
            <h3 class="text-xl font-bold">Record Game Result</h3>
            <BaseButton
                type="button"
                variant="primary"
                customClass="text-sm sm:w-auto flex justify-center"
                @click="loadLastGamePlayers"
                icon="mdi:backup-restore"
                :disabled="isLoadingLastGame"
                :loading="isLoadingLastGame"
            >
                Load Last Group
            </BaseButton>
        </div>
        <form @submit.prevent="submitGame">
            <div class="mb-8">
                <label
                    class="block text-sm font-semibold text-primary mb-3 uppercase tracking-wider"
                >
                    <Icon name="mdi:account-group" class="mr-1 mb-1" />
                    Players
                </label>
                <div
                    v-for="(participant, index) in newGame.participants"
                    :key="index"
                    class="bg-secondary rounded-lg p-3 mb-3 border border-border-color shadow-sm relative group flex flex-col gap-3 sm:flex-row sm:items-center transition-all hover:border-accent-primary"
                    :style="{ zIndex: 50 - index }"
                >
                    <div class="flex-1 min-w-[200px]">
                        <label
                            class="block text-xs font-medium text-muted mb-1 ml-1"
                            >Player {{ index + 1 }}</label
                        >
                        <BaseSelect
                            v-model="participant.playerId"
                            class="w-full"
                            @change="onPlayerChange(index)"
                            placeholder="-- Select Player --"
                            :options="
                                players.map((player) => ({
                                    label: player.name,
                                    value: player.id,
                                    disabled: newGame.participants.some(
                                        (p, i) =>
                                            i !== index &&
                                            p.playerId === player.id,
                                    ),
                                }))
                            "
                        />
                    </div>

                    <div class="hidden sm:block text-muted text-xl pt-5">
                        <Icon name="mdi:sword-cross" />
                    </div>

                    <div class="flex-1 min-w-[200px]">
                        <label
                            class="block text-xs font-medium text-muted mb-1 ml-1"
                            >Commander / Deck</label
                        >
                        <BaseSelect
                            v-model="participant.deckId"
                            class="w-full"
                            :disabled="!participant.playerId"
                            placeholder="-- Select Deck --"
                            :options="
                                getDecksForPlayer(participant.playerId).map(
                                    (deck) => ({
                                        label: deck.commander_name,
                                        value: deck.id,
                                    }),
                                )
                            "
                        />
                    </div>

                    <button
                        v-if="newGame.participants.length > 2"
                        type="button"
                        class="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
                        @click="removeParticipant(index)"
                        title="Remove Player"
                    >
                        <Icon name="mdi:close" class="text-sm" />
                    </button>
                </div>

                <button
                    v-if="newGame.participants.length < 6"
                    type="button"
                    class="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border-color rounded-lg text-muted hover:text-accent-primary hover:border-accent-primary hover:bg-tertiary transition-all font-medium mt-4"
                    @click="addParticipant"
                >
                    <Icon name="mdi:plus-circle-outline" class="text-xl" />
                    Add Another Player
                </button>
            </div>

            <div class="mb-8">
                <label
                    class="block text-sm font-semibold text-primary mb-3 uppercase tracking-wider"
                >
                    <Icon name="mdi:trophy-outline" class="mr-1 mb-1" />
                    Winner / Result
                </label>
                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="p in validParticipants"
                        :key="p.playerId"
                        type="button"
                        @click="newGame.winnerId = p.playerId"
                        class="px-4 py-2 rounded-full text-sm font-medium transition-all"
                        :class="
                            newGame.winnerId === p.playerId
                                ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/50 border border-accent-primary'
                                : 'bg-tertiary text-text-secondary border border-border-color hover:border-accent-primary hover:text-text-primary'
                        "
                    >
                        {{ getPlayerName(p.playerId) }}
                    </button>
                    <button
                        type="button"
                        @click="newGame.winnerId = 'draw'"
                        class="px-4 py-2 rounded-full text-sm font-medium transition-all"
                        :class="
                            newGame.winnerId === 'draw'
                                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/50 border border-orange-500'
                                : 'bg-tertiary text-text-secondary border border-border-color hover:border-orange-500 hover:text-text-primary'
                        "
                    >
                        Draw / Tie
                    </button>
                    <button
                        type="button"
                        @click="newGame.winnerId = 'tbd'"
                        class="px-4 py-2 rounded-full text-sm font-medium transition-all"
                        :class="
                            newGame.winnerId === 'tbd'
                                ? 'bg-slate-600 text-white shadow-md shadow-slate-600/50 border border-slate-500'
                                : 'bg-tertiary text-text-secondary border border-border-color hover:border-slate-500 hover:text-text-primary'
                        "
                    >
                        TBD / No Winner Yet
                    </button>
                </div>
            </div>

            <div class="mb-8">
                <label
                    class="block text-sm font-semibold text-primary mb-3 uppercase tracking-wider"
                >
                    <Icon name="mdi:note-text-outline" class="mr-1 mb-1" />
                    Notes (Optional)
                </label>
                <textarea
                    id="gameNotes"
                    v-model="newGame.notes"
                    class="w-full bg-secondary border border-border-color rounded-lg p-3 text-sm text-primary placeholder-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all resize-none"
                    rows="3"
                    placeholder="Any memorable moments? Example: 'Marshall countered my Commander 3 times...'"
                ></textarea>
            </div>

            <div class="flex gap-3 justify-end items-center">
                <BaseButton
                    type="button"
                    variant="ghost"
                    @click="resetForm"
                    :disabled="isSubmitting"
                >
                    Reset Selections
                </BaseButton>
                <BaseButton
                    type="button"
                    variant="secondary"
                    @click="handleCancel"
                    :disabled="isSubmitting"
                >
                    Cancel
                </BaseButton>
                <BaseButton
                    type="submit"
                    variant="primary"
                    :disabled="isSubmitting || !isFormValid"
                    :loading="isSubmitting"
                >
                    Save Game
                </BaseButton>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits } from "vue";

const db = useDb();
const supabase = useSupabaseClient();
const emit = defineEmits(["saved", "cancel"]);

const players = ref([]);
const decks = ref([]);
const isSubmitting = ref(false);

const newGame = ref({
    participants: [
        { playerId: "", deckId: "" },
        { playerId: "", deckId: "" },
        { playerId: "", deckId: "" },
        { playerId: "", deckId: "" },
    ],
    winnerId: "tbd",
    notes: "",
});

const validParticipants = computed(() => {
    return newGame.value.participants.filter((p) => p.playerId);
});

const isFormValid = computed(() => {
    const activeParticipants = validParticipants.value;
    if (activeParticipants.length < 2) return false;
    if (activeParticipants.some((p) => !p.deckId)) return false;
    if (!newGame.value.winnerId) return false;
    return true;
});

const getDecksForPlayer = (playerId) => {
    if (!playerId) return [];
    return decks.value.filter((d) => d.player_id === playerId);
};

const getPlayerName = (playerId) => {
    const player = players.value.find((p) => p.id === playerId);
    return player ? player.name : "Unknown";
};

const addParticipant = () => {
    if (newGame.value.participants.length < 6) {
        newGame.value.participants.push({ playerId: "", deckId: "" });
    }
};

const removeParticipant = (index) => {
    newGame.value.participants.splice(index, 1);
    if (
        newGame.value.winnerId &&
        !validParticipants.value.find(
            (p) => p.playerId === newGame.value.winnerId,
        )
    ) {
        newGame.value.winnerId = "";
    }
};

const onPlayerChange = (index) => {
    const participant = newGame.value.participants[index];
    const availableDecks = getDecksForPlayer(participant.playerId);

    if (availableDecks.length === 1) {
        participant.deckId = availableDecks[0].id;
    } else {
        participant.deckId = "";
    }
};

const submitGame = async () => {
    if (!isFormValid.value) return;

    isSubmitting.value = true;
    try {
        const gameData = {
            played_on: new Date().toISOString(),
            winner_id:
                newGame.value.winnerId === "draw" ||
                newGame.value.winnerId === "tbd"
                    ? null
                    : newGame.value.winnerId,
            is_draw: newGame.value.winnerId === "draw",
            notes: newGame.value.notes,
        };

        const { data: savedGame, error: gameError } = await supabase
            .from("games")
            .insert(gameData)
            .select()
            .single();

        if (gameError) throw gameError;

        const participantData = validParticipants.value.map((p) => ({
            game_id: savedGame.id,
            player_id: p.playerId,
            deck_id: p.deckId || null,
        }));

        const { error: partError } = await supabase
            .from("game_participants")
            .insert(participantData);

        if (partError) throw partError;

        resetForm();
        emit("saved");
    } catch (error) {
        console.error("Failed to save game:", error);
        alert("Failed to save game. Please try again.");
    } finally {
        isSubmitting.value = false;
    }
};

const resetForm = () => {
    newGame.value = {
        participants: [
            { playerId: "", deckId: "" },
            { playerId: "", deckId: "" },
            { playerId: "", deckId: "" },
            { playerId: "", deckId: "" },
        ],
        winnerId: "tbd",
        notes: "",
    };
};

const handleCancel = () => {
    resetForm();
    emit("cancel");
};

const isLoadingLastGame = ref(false);

const loadLastGamePlayers = async () => {
    isLoadingLastGame.value = true;
    try {
        const lastGames = await db.getGamesPaginated(1, 1);
        if (lastGames && lastGames.length > 0) {
            const lastGame = lastGames[0];
            const previousParticipants = lastGame.game_participants;

            if (previousParticipants && previousParticipants.length > 0) {
                // Clear out defaults to match exactly the previous participant count
                newGame.value.participants = [];

                previousParticipants.forEach((p) => {
                    const availableDecks = getDecksForPlayer(p.player_id);
                    newGame.value.participants.push({
                        playerId: p.player_id,
                        deckId:
                            availableDecks.length === 1
                                ? availableDecks[0].id
                                : "",
                    });
                });

                // If it was less than 4, pad it out to at least 4 for visual consistency or just leave it.
                // Leaving it matching exactly the last game is usually better.

                // Clear winner and notes
                newGame.value.winnerId = "tbd";
                newGame.value.notes = "";
            } else {
                alert("Could not load players from the last game.");
            }
        } else {
            alert("No previous games found to load.");
        }
    } catch (e) {
        console.error("Error loading last game", e);
        alert("Failed to load last game.");
    } finally {
        isLoadingLastGame.value = false;
    }
};

onMounted(async () => {
    try {
        const [pData, dData] = await Promise.all([
            db.getPlayers(),
            db.getDecks(),
        ]);
        players.value = pData;
        decks.value = dData;
    } catch (error) {
        console.error("Failed to load form data:", error);
    }
});
</script>
