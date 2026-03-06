<template>
    <div class="animate-fade-in max-w-4xl mx-auto">
        <div class="mb-6">
            <h1
                class="text-3xl font-bold font-heading text-primary flex items-center gap-3"
            >
                <Icon name="mdi:account-multiple" class="text-accent-primary" />
                Friends
            </h1>
            <p class="text-secondary mt-2">
                Connect with other players to view their stats, decks, and game
                history.
            </p>
        </div>

        <div v-if="isLoading" class="flex justify-center py-12">
            <Icon name="mdi:loading" class="animate-spin text-5xl text-muted" />
        </div>

        <div v-else-if="!hasProfile" class="card p-8 text-center">
            <Icon
                name="mdi:card-account-details-outline"
                class="text-5xl text-accent-primary opacity-50 mb-4"
            />
            <h2 class="text-xl font-bold text-primary mb-2">
                Create Your Profile First
            </h2>
            <p class="text-secondary mb-6">
                You need a display name and friend code before you can add
                friends.
            </p>
            <BaseButton to="/profile" variant="primary" icon="mdi:arrow-right">
                Set Up Profile
            </BaseButton>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column: Add Friend & Pending -->
            <div class="lg:col-span-1 flex flex-col gap-6">
                <!-- Add Friend -->
                <div class="card p-6">
                    <h3
                        class="text-xl font-bold mb-4 border-b border-border-color pb-2 flex items-center gap-2"
                    >
                        <Icon
                            name="mdi:account-plus"
                            class="text-accent-primary"
                        />
                        Add Friend
                    </h3>
                    <form
                        @submit.prevent="addFriend"
                        class="flex flex-col gap-3"
                    >
                        <p class="text-sm text-secondary mb-1">
                            Enter a player's exact Friend Code to send them an
                            invite.
                        </p>
                        <div class="flex gap-2">
                            <BaseInput
                                id="friendCode"
                                v-model="friendCodeInput"
                                type="text"
                                required
                                class="w-full font-mono bg-slate-900 border-slate-700 focus:border-accent-primary transition-colors"
                                placeholder="Player#1234"
                            />
                            <BaseButton
                                type="submit"
                                variant="primary"
                                :disabled="isAdding || !friendCodeInput"
                                class="whitespace-nowrap shrink-0"
                            >
                                <span v-if="isAdding">Sending...</span>
                                <span v-else>Send</span>
                            </BaseButton>
                        </div>

                        <!-- Status Messages -->
                        <div
                            v-if="addErrorMsg"
                            class="flex items-center gap-1.5 text-mtg-red text-sm mt-1 bg-red-950/30 p-2 rounded-md border border-mtg-red/20"
                        >
                            <Icon
                                name="mdi:alert-circle-outline"
                                class="shrink-0"
                            />
                            {{ addErrorMsg }}
                        </div>
                        <div
                            v-if="addSuccessMsg"
                            class="flex items-center gap-1.5 text-mtg-green text-sm mt-1 bg-green-950/30 p-2 rounded-md border border-mtg-green/20"
                        >
                            <Icon
                                name="mdi:check-circle-outline"
                                class="shrink-0"
                            />
                            {{ addSuccessMsg }}
                        </div>
                    </form>
                </div>

                <!-- Pending Incoming Requests -->
                <div
                    v-if="incomingRequests.length > 0"
                    class="card p-6 border-l-4 border-l-mtg-red bg-red-950/10 transition-colors"
                >
                    <h3
                        class="text-xl font-bold mb-4 border-b border-border-color pb-2 flex items-center gap-2"
                    >
                        <Icon
                            name="mdi:account-clock"
                            :class="
                                incomingRequests.length > 0
                                    ? 'text-mtg-red'
                                    : 'text-secondary'
                            "
                        />
                        Friend Requests
                        <span
                            v-if="incomingRequests.length > 0"
                            class="bg-mtg-red text-white text-xs px-2 py-0.5 rounded-full ml-auto"
                            >{{ incomingRequests.length }}</span
                        >
                    </h3>

                    <div class="flex flex-col gap-3">
                        <div
                            v-for="req in incomingRequests"
                            :key="req.id"
                            class="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                        >
                            <div>
                                <p class="font-bold text-primary">
                                    {{ req.user_profile?.display_name }}
                                </p>
                                <p class="text-xs text-muted font-mono">
                                    {{ req.user_profile?.friend_code }}
                                </p>
                            </div>
                            <div class="flex gap-2">
                                <button
                                    @click="
                                        respondToRequest(req.id, 'accepted')
                                    "
                                    class="p-2 bg-mtg-green/20 text-mtg-green hover:bg-mtg-green/40 rounded-md transition-colors"
                                    title="Accept"
                                >
                                    <Icon name="mdi:check" class="text-xl" />
                                </button>
                                <button
                                    @click="
                                        respondToRequest(req.id, 'rejected')
                                    "
                                    class="p-2 bg-mtg-red/20 text-mtg-red hover:bg-mtg-red/40 rounded-md transition-colors"
                                    title="Reject"
                                >
                                    <Icon name="mdi:close" class="text-xl" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pending Outgoing Requests -->
                <div v-if="outgoingRequests.length > 0" class="card p-6">
                    <h3
                        class="text-md font-bold mb-4 border-b border-border-color pb-2 flex items-center gap-2 text-secondary"
                    >
                        <Icon name="mdi:arrow-top-right" />
                        Sent Requests
                        <span
                            v-if="outgoingRequests.length > 0"
                            class="bg-accent-primary text-white text-xs px-2 py-0.5 rounded-full ml-auto"
                            >{{ outgoingRequests.length }}</span
                        >
                    </h3>
                    <div class="flex flex-col gap-2">
                        <div
                            v-for="req in outgoingRequests"
                            :key="req.id"
                            class="flex items-center justify-between p-2 bg-slate-800 rounded-lg"
                        >
                            <div class="truncate pr-2">
                                <p
                                    class="text-sm font-bold text-primary truncate"
                                >
                                    {{ req.friend_profile?.display_name }}
                                </p>
                            </div>
                            <button
                                @click="cancelRequest(req.id)"
                                class="text-xs text-mtg-red hover:text-white transition-colors shrink-0"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Friends List -->
            <div class="lg:col-span-2 card p-6">
                <h3
                    class="text-xl font-bold mb-4 border-b border-border-color pb-2 flex items-center gap-2"
                >
                    <Icon
                        name="mdi:account-group"
                        class="text-accent-primary"
                    />
                    My Friends
                </h3>

                <div
                    v-if="friends.length === 0"
                    class="text-center py-10 opacity-60"
                >
                    <Icon name="mdi:account-off" class="text-4xl mb-2" />
                    <p>You haven't added any friends yet.</p>
                </div>

                <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                        v-for="friendship in friends"
                        :key="friendship.id"
                        class="p-4 bg-slate-800 rounded-lg flex items-center justify-between border border-transparent hover:border-slate-600 transition-colors"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary font-bold text-lg shrink-0"
                            >
                                {{
                                    getFriendProfile(friendship)
                                        ?.display_name.charAt(0)
                                        .toUpperCase()
                                }}
                            </div>
                            <div class="overflow-hidden">
                                <p class="font-bold text-primary truncate">
                                    {{
                                        getFriendProfile(friendship)
                                            ?.display_name
                                    }}
                                </p>
                                <p
                                    class="text-xs text-muted font-mono truncate"
                                >
                                    {{
                                        getFriendProfile(friendship)
                                            ?.friend_code
                                    }}
                                </p>
                            </div>
                        </div>
                        <button
                            @click="removeFriend(friendship.id)"
                            class="p-2 text-secondary hover:text-mtg-red transition-colors shrink-0"
                            title="Remove Friend"
                        >
                            <Icon name="mdi:account-minus" class="text-xl" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Remove Friend Confirmation Modal -->
        <BaseModal
            v-model="showRemoveModal"
            title="Remove Friend"
            :loading="isRemoving"
            @confirm="confirmRemoveFriend"
        >
            <p>
                Are you sure you want to remove
                <span class="font-bold text-mtg-red">{{
                    friendToRemoveName
                }}</span>
                from your friends list?
            </p>
            <p class="text-xs text-muted mt-2">
                This action will delete the friendship connection permanently.
            </p>
        </BaseModal>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";

const db = useDb();
const user = useSupabaseUser();

const isLoading = ref(true);
const hasProfile = ref(false);
const allFriendships = ref([]);

const friendCodeInput = ref("");
const isAdding = ref(false);
const addErrorMsg = ref("");
const addSuccessMsg = ref("");

const showRemoveModal = ref(false);
const isRemoving = ref(false);
const friendToRemoveId = ref(null);
const friendToRemoveName = ref("");

// Computed Filters
const incomingRequests = computed(() => {
    const userId = user.value?.id || user.value?.sub;
    return allFriendships.value.filter(
        (f) => f.status === "pending" && f.friend_id === userId,
    );
});
const outgoingRequests = computed(() => {
    const userId = user.value?.id || user.value?.sub;
    return allFriendships.value.filter(
        (f) => f.status === "pending" && f.user_id === userId,
    );
});
const friends = computed(() => {
    return allFriendships.value.filter((f) => f.status === "accepted");
});

// Helper to get the profile of the "other" person in a friendship
const getFriendProfile = (friendship) => {
    const userId = user.value?.id || user.value?.sub;
    if (friendship.user_id === userId) {
        return friendship.friend_profile;
    }
    return friendship.user_profile;
};

const loadData = async () => {
    isLoading.value = true;
    try {
        const profile = await db.getProfile();
        if (profile && profile.friend_code) {
            hasProfile.value = true;
            allFriendships.value = await db.getFriendships();
        } else {
            hasProfile.value = false;
        }
    } catch (err) {
        console.error(err);
    } finally {
        isLoading.value = false;
    }
};

const addFriend = async () => {
    isAdding.value = true;
    addErrorMsg.value = "";
    addSuccessMsg.value = "";

    try {
        const friendProfile = await db.getProfileByFriendCode(
            friendCodeInput.value,
        );
        if (!friendProfile) {
            addErrorMsg.value = "Friend code not found.";
            return;
        }

        if (friendProfile.id === user.value?.id) {
            addErrorMsg.value = "You cannot add yourself.";
            return;
        }

        // Check if friendship already exists
        const existing = allFriendships.value.find(
            (f) =>
                f.user_id === friendProfile.id ||
                f.friend_id === friendProfile.id,
        );
        if (existing) {
            if (existing.status === "accepted")
                addErrorMsg.value = "You are already friends.";
            else if (
                existing.status === "pending" &&
                existing.user_id === user.value?.id
            )
                addErrorMsg.value = "You already sent an invite.";
            else if (
                existing.status === "pending" &&
                existing.friend_id === user.value?.id
            )
                addErrorMsg.value =
                    "They already sent you an invite! Accept it below.";
            return;
        }

        await db.sendFriendRequest(friendProfile.id);
        addSuccessMsg.value = "Friend request sent!";
        friendCodeInput.value = "";

        // Reload data
        allFriendships.value = await db.getFriendships();
    } catch (err) {
        console.error(err);
        addErrorMsg.value = "An error occurred.";
    } finally {
        isAdding.value = false;
    }
};

const respondToRequest = async (id, status) => {
    try {
        await db.updateFriendshipStatus(id, status);
        allFriendships.value = await db.getFriendships();
    } catch (err) {
        console.error(err);
    }
};

const cancelRequest = async (id) => {
    try {
        await db.deleteFriendship(id);
        allFriendships.value = await db.getFriendships();
    } catch (err) {
        console.error(err);
    }
};

const removeFriend = (id) => {
    friendToRemoveId.value = id;
    const friendship = friends.value.find((f) => f.id === id);
    friendToRemoveName.value =
        getFriendProfile(friendship)?.display_name || "this friend";
    showRemoveModal.value = true;
};

const confirmRemoveFriend = async () => {
    if (!friendToRemoveId.value) return;

    isRemoving.value = true;
    try {
        await db.deleteFriendship(friendToRemoveId.value);
        allFriendships.value = await db.getFriendships();
        showRemoveModal.value = false;
    } catch (err) {
        console.error(err);
        alert("Failed to remove friend.");
    } finally {
        isRemoving.value = false;
        friendToRemoveId.value = null;
    }
};

watch(
    user,
    (newUser) => {
        if (newUser) {
            loadData();
        }
    },
    { immediate: true },
);
</script>
