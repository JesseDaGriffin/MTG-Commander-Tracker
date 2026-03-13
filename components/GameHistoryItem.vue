<template>
    <div
        class="bg-tertiary rounded-md p-5 border-l-4 border-l-accent-primary flex flex-col gap-4 transition-all"
    >
        <!-- Header: Date & Winner (Clickable to expand) -->
        <div
            class="flex flex-col gap-3 justify-start items-start border-border-color pb-1 cursor-pointer group relative z-10"
            :class="{ 'border-b pb-3': isExpanded || isEditingWinner }"
            @click="isExpanded = !isExpanded"
        >
            <div class="flex justify-between w-full items-start">
                <div>
                    <div class="text-lg font-semibold flex items-center">
                        <span class="text-muted mr-2">Winner:</span>
                        <span
                            v-if="game.winner_id"
                            class="text-mtg-red flex items-center gap-1 font-bold"
                        >
                            <Icon
                                name="mdi:crown"
                                class="text-amber-400 text-xl shrink-0"
                            />
                            <PlayerName :player="game.players" />
                        </span>
                        <span
                            v-else-if="game.is_draw"
                            class="text-mtg-red font-bold"
                            >Draw / Tie</span
                        >
                        <span
                            v-else
                            class="text-secondary font-bold flex items-center gap-2"
                        >
                            TBD
                            <BaseButton
                                v-if="
                                    !isEditingWinner &&
                                    (game.user_id === (user?.id || user?.sub) ||
                                        isUserInvolved)
                                "
                                @click.stop="isEditingWinner = true"
                                variant="secondary"
                                customClass="text-xs px-2 py-1 h-auto min-h-0 ml-2 bg-secondary hover:bg-primary border border-border-color shadow-sm"
                            >
                                Set Winner
                            </BaseButton>
                        </span>
                    </div>
                    <div
                        v-if="winnerDeckName"
                        class="text-[0.8rem] text-muted mb-1.5 pr-2"
                    >
                        Playing:
                        <span class="text-text-primary">{{
                            winnerDeckName
                        }}</span>
                    </div>
                    <div
                        class="text-sm text-muted flex items-center gap-1 mt-1"
                    >
                        <Icon name="mdi:calendar-clock" />
                        <ClientOnly>
                            {{ formatDateTime(game.played_on) }}
                            <template #fallback>
                                <span>Loading date...</span>
                            </template>
                        </ClientOnly>
                    </div>
                </div>
                <Icon
                    :name="isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'"
                    class="text-muted text-2xl transition-transform group-hover:text-accent-primary"
                />
            </div>
            <div
                v-if="game.notes"
                class="text-muted text-sm italic bg-bg-secondary p-2 rounded w-full sm:w-fit border border-white/5"
            >
                "{{ game.notes }}"
            </div>

            <!-- Edit Winner Form -->
            <div
                v-if="isEditingWinner"
                class="w-full bg-white/5 p-4 mt-4 rounded-xl border border-white/10 shadow-lg relative animate-fade-in backdrop-blur-sm"
                @click.stop
            >
                <div class="mb-5">
                    <label
                        class="block text-sm font-semibold text-primary mb-3 uppercase tracking-wider"
                    >
                        <Icon name="mdi:trophy-outline" class="mr-1 mb-1" />
                        Select Winner
                    </label>
                    <div class="flex flex-wrap gap-2">
                        <button
                            v-for="p in game.game_participants"
                            :key="p.player_id"
                            type="button"
                            @click="selectedWinnerId = p.player_id"
                            class="px-4 py-2 rounded-full text-sm font-medium transition-all"
                            :class="
                                selectedWinnerId === p.player_id
                                    ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/50 border border-accent-primary'
                                    : 'bg-tertiary text-text-secondary border border-border-color hover:border-accent-primary hover:text-text-primary'
                            "
                        >
                            {{ p.players?.name || "Unknown" }}
                        </button>
                        <button
                            type="button"
                            @click="selectedWinnerId = 'draw'"
                            class="px-4 py-2 rounded-full text-sm font-medium transition-all"
                            :class="
                                selectedWinnerId === 'draw'
                                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/50 border border-orange-500'
                                    : 'bg-tertiary text-text-secondary border border-border-color hover:border-orange-500 hover:text-text-primary'
                            "
                        >
                            Draw / Tie
                        </button>
                    </div>
                </div>

                <div class="mb-5">
                    <label
                        class="block text-sm font-semibold text-primary mb-3 uppercase tracking-wider"
                    >
                        <Icon name="mdi:note-text-outline" class="mr-1 mb-1" />
                        Notes (Optional)
                    </label>
                    <textarea
                        v-model="editNotes"
                        class="w-full bg-secondary border border-border-color rounded-lg p-3 text-sm text-primary placeholder-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all resize-none"
                        rows="2"
                        placeholder="Any memorable moments?"
                    ></textarea>
                </div>

                <div class="flex gap-2 justify-end">
                    <BaseButton
                        variant="ghost"
                        @click="isEditingWinner = false"
                        :disabled="isSaving"
                    >
                        Cancel
                    </BaseButton>
                    <BaseButton
                        variant="primary"
                        customClass="px-4"
                        @click="saveWinner"
                        :disabled="!selectedWinnerId || isSaving"
                        :loading="isSaving"
                    >
                        Save
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Participants List -->
        <div v-show="isExpanded" class="animate-fade-in">
            <h4
                class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3"
            >
                Participants
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div
                    v-for="participant in game.game_participants"
                    :key="participant.id"
                    class="flex items-center gap-2 bg-bg-secondary py-1.5 px-3 rounded-md border border-white/5"
                    :class="{
                        'ring-1 ring-accent-primary bg-accent-primary/5':
                            game.winner_id === participant.player_id,
                    }"
                >
                    <!-- Player & Deck Info -->
                    <div class="flex flex-col overflow-hidden">
                        <span
                            class="font-medium text-text-primary text-sm truncate"
                            :class="{
                                'text-accent-primary':
                                    game.winner_id === participant.player_id,
                            }"
                        >
                            <PlayerName :player="participant.players" />
                        </span>
                        <span class="text-[0.7rem] text-muted truncate">
                            {{
                                participant.decks?.commander_name ||
                                "No Deck Listed"
                            }}
                        </span>
                    </div>

                    <!-- Winner Indicator -->
                    <Icon
                        v-if="game.winner_id === participant.player_id"
                        name="mdi:trophy"
                        class="text-amber-400 ml-auto opacity-70 text-lg"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, ref, computed, defineEmits } from "vue";

const user = useSupabaseUser();

const props = defineProps({
    game: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["updated"]);

const isExpanded = ref(false);
const isEditingWinner = ref(false);
const selectedWinnerId = ref("");
const editNotes = ref(props.game.notes || "");
const isSaving = ref(false);

const isUserInvolved = computed(() => {
    if (!user.value) return false;
    const userId = user.value.id || user.value.sub;
    return props.game.game_participants?.some(
        (p) => p.players?.user_id === userId,
    );
});

const saveWinner = async () => {
    if (!selectedWinnerId.value) return;
    isSaving.value = true;
    try {
        const db = useDb();
        await db.updateGameWinner(
            props.game.id,
            selectedWinnerId.value,
            editNotes.value,
        );
        emit("updated");
        isEditingWinner.value = false;
    } catch (err) {
        console.error("Failed to save winner:", err);
        alert("Failed to save winner.");
    } finally {
        isSaving.value = false;
    }
};

const winnerDeckName = computed(() => {
    if (!props.game.winner_id) return null;
    const winnerParticipant = props.game.game_participants?.find(
        (p) => p.player_id === props.game.winner_id,
    );
    return winnerParticipant?.decks?.commander_name || null;
});

const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};
</script>
