<template>
    <div class="card p-6">
        <h3 class="text-xl font-bold mb-4">Record Game Result</h3>
        <form @submit.prevent="submitGame">
            <div class="mb-6">
                <label class="block text-sm font-medium text-secondary mb-2"
                    >Players & Decks</label
                >
                <div
                    v-for="(participant, index) in newGame.participants"
                    :key="index"
                    class="flex gap-2 items-center mb-2"
                    :style="{ zIndex: 50 - index, position: 'relative' }"
                >
                    <BaseSelect
                        v-model="participant.playerId"
                        class="flex-1"
                        @change="onPlayerChange(index)"
                        placeholder="-- Player --"
                        :options="
                            players.map((player) => ({
                                label: player.name,
                                value: player.id,
                                disabled: newGame.participants.some(
                                    (p, i) =>
                                        i !== index && p.playerId === player.id,
                                ),
                            }))
                        "
                    />

                    <BaseSelect
                        v-model="participant.deckId"
                        class="flex-1"
                        :disabled="!participant.playerId"
                        placeholder="-- Deck --"
                        :options="
                            getDecksForPlayer(participant.playerId).map(
                                (deck) => ({
                                    label: deck.commander_name,
                                    value: deck.id,
                                }),
                            )
                        "
                    />

                    <button
                        v-if="newGame.participants.length > 2"
                        type="button"
                        class="text-red-500 hover:bg-tertiary p-2 rounded-md transition-colors"
                        @click="removeParticipant(index)"
                    >
                        <Icon name="mdi:close" />
                    </button>
                </div>

                <button
                    v-if="newGame.participants.length < 6"
                    type="button"
                    class="btn btn-secondary text-sm mt-2"
                    @click="addParticipant"
                >
                    <Icon name="mdi:plus" class="mr-1" /> Add Player
                </button>
            </div>

            <div class="mb-6">
                <label
                    class="block text-sm font-medium text-secondary mb-2"
                    for="winnerSelect"
                    >Winner</label
                >
                <BaseSelect
                    id="winnerSelect"
                    v-model="newGame.winnerId"
                    required
                    placeholder="-- Select Winner --"
                    :options="
                        validParticipants
                            .map((p) => ({
                                label: getPlayerName(p.playerId),
                                value: p.playerId,
                            }))
                            .concat([
                                {
                                    label: '-- Draw / No Winner --',
                                    value: 'draw',
                                },
                            ])
                    "
                />
            </div>

            <div class="mb-8">
                <label
                    class="block text-sm font-medium text-secondary mb-2"
                    for="gameNotes"
                    >Notes (Optional)</label
                >
                <textarea
                    id="gameNotes"
                    v-model="newGame.notes"
                    class="form-input"
                    rows="2"
                    placeholder="Any memorable moments?"
                ></textarea>
            </div>

            <div class="flex gap-3 justify-end items-center">
                <button
                    type="button"
                    class="btn btn-secondary"
                    @click="$emit('cancel')"
                    :disabled="isSubmitting"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="isSubmitting || validParticipants.length < 2"
                >
                    <Icon
                        v-if="isSubmitting"
                        name="mdi:loading"
                        class="animate-spin mr-2"
                    />
                    Save Game
                </button>
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
    winnerId: "",
    notes: "",
});

const validParticipants = computed(() => {
    return newGame.value.participants.filter((p) => p.playerId);
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
    newGame.value.participants[index].deckId = "";
};

const submitGame = async () => {
    if (validParticipants.value.length < 2) return;

    isSubmitting.value = true;
    try {
        const gameData = {
            played_on: new Date().toISOString(),
            winner_id:
                newGame.value.winnerId === "draw"
                    ? null
                    : newGame.value.winnerId,
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

        // Reset form
        newGame.value = {
            participants: [
                { playerId: "", deckId: "" },
                { playerId: "", deckId: "" },
                { playerId: "", deckId: "" },
                { playerId: "", deckId: "" },
            ],
            winnerId: "",
            notes: "",
        };

        emit("saved");
    } catch (error) {
        console.error("Failed to save game:", error);
        alert("Failed to save game. Please try again.");
    } finally {
        isSubmitting.value = false;
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
