```html
<template>
    <div class="animate-fade-in">
        <!-- Header Banner -->
        <PageHeader
            title="Players"
            label="Roster"
            description="Manage your playgroup and their details."
            icon="mdi:account-group"
        />

        <!-- Add Player Form -->
        <div v-if="showAddForm" class="card p-6 mb-6">
            <h3 class="text-xl mb-4 font-bold">Add New Player</h3>
            <form @submit.prevent="submitPlayer">
                <div class="form-group mb-4">
                    <label
                        class="form-label block text-sm font-medium text-secondary mb-2"
                        for="playerName"
                        >Player Name</label
                    >
                    <BaseInput
                        id="playerName"
                        v-model="newPlayerName"
                        type="text"
                        placeholder="Enter player name"
                        maxlength="50"
                        required
                        :disabled="isSubmitting"
                    />
                </div>
                <div class="flex gap-3 justify-end mt-6">
                    <BaseButton
                        type="button"
                        variant="secondary"
                        @click="showAddForm = false"
                        :disabled="isSubmitting"
                    >
                        Cancel
                    </BaseButton>
                    <BaseButton
                        type="submit"
                        variant="primary"
                        :disabled="isSubmitting"
                        :loading="isSubmitting"
                    >
                        Save Player
                    </BaseButton>
                </div>
            </form>
        </div>

        <!-- Player List -->
        <div class="card p-6">
            <div
                class="flex items-center justify-between border-b border-border-color pb-4 mb-4"
            >
                <h3 class="text-xl font-bold">Player List</h3>
                <BaseButton
                    v-if="!showAddForm"
                    variant="primary"
                    @click="showAddForm = true"
                    icon="mdi:account-plus"
                >
                    Add Player
                </BaseButton>
            </div>

            <div v-if="isLoading" class="flex justify-center p-6 text-muted">
                <Icon name="mdi:loading" class="animate-spin text-5xl" />
            </div>

            <div
                v-else-if="players.length > 0"
                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
                <PlayerListItem
                    v-for="player in players"
                    :key="player.id"
                    :player="player"
                />
            </div>

            <div
                v-else
                class="flex flex-col items-center justify-center p-12 text-center text-muted"
            >
                <Icon
                    name="mdi:account-group-outline"
                    class="text-5xl mb-4 opacity-50"
                />
                <p>No players added yet.</p>
                <BaseButton
                    variant="primary"
                    customClass="mt-6"
                    @click="showAddForm = true"
                >
                    Add Your First Player
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const db = useDb();

const players = ref([]);
const isLoading = ref(true);
const showAddForm = ref(false);
const newPlayerName = ref("");
const isSubmitting = ref(false);

const loadPlayers = async () => {
    isLoading.value = true;
    try {
        players.value = await db.getPlayers();
    } catch (error) {
        console.error("Failed to load players:", error);
    } finally {
        isLoading.value = false;
    }
};

const submitPlayer = async () => {
    if (!newPlayerName.value.trim()) return;

    isSubmitting.value = true;
    try {
        await db.addPlayer(newPlayerName.value.trim());
        newPlayerName.value = "";
        await loadPlayers(); // Reload the list
    } catch (error) {
        console.error("Failed to add player:", error);
        alert("Failed to add player. Name might already exist.");
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
    loadPlayers();
});
</script>
