<template>
    <div class="animate-fade-in max-w-2xl mx-auto">
        <div class="mb-6">
            <h1
                class="text-3xl font-bold font-heading text-primary flex items-center gap-3"
            >
                <Icon
                    name="mdi:card-account-details-outline"
                    class="text-accent-primary"
                />
                My Profile
            </h1>
            <p class="text-secondary mt-2">
                Manage your public profile and friend code.
            </p>
        </div>

        <div v-if="isLoading" class="flex justify-center py-12">
            <Icon name="mdi:loading" class="animate-spin text-5xl text-muted" />
        </div>

        <div v-else class="card p-6 md:p-8">
            <form @submit.prevent="saveProfile" class="flex flex-col gap-6">
                <!-- Display Name -->
                <div>
                    <label
                        class="block text-sm font-medium text-secondary mb-2"
                        for="displayName"
                    >
                        Display Name
                    </label>
                    <BaseInput
                        id="displayName"
                        v-model="displayName"
                        type="text"
                        required
                        maxlength="30"
                        placeholder="e.g. Planeswalker"
                    />
                    <p class="text-xs text-muted mt-2">
                        This is the name other players will see on leaderboards
                        and in games.
                    </p>
                </div>

                <!-- Friend Code -->
                <div>
                    <label
                        class="block text-sm font-medium text-secondary mb-2"
                        for="friendCode"
                    >
                        Friend Code
                    </label>
                    <div class="flex gap-2">
                        <BaseInput
                            id="friendCode"
                            v-model="friendCode"
                            type="text"
                            readonly
                            placeholder="Generate upon saving"
                            class="bg-slate-900 border-slate-700 text-slate-400 cursor-not-allowed font-mono w-full"
                        />
                        <BaseButton
                            type="button"
                            variant="secondary"
                            icon="mdi:content-copy"
                            @click="copyFriendCode"
                            :title="copied ? 'Copied!' : 'Copy to clipboard'"
                        >
                            {{ copied ? "Copied!" : "Copy" }}
                        </BaseButton>
                    </div>
                    <p class="text-xs text-muted mt-2">
                        Share this code with your group so they can add you as a
                        friend.
                    </p>
                </div>

                <div
                    v-if="errorMsg"
                    class="p-3 bg-red-500/10 border border-mtg-red text-mtg-red rounded-lg mt-2 text-sm"
                >
                    <Icon
                        name="mdi:alert-circle-outline"
                        class="mr-1 h-4 w-4 inline-block -mt-1"
                    />
                    {{ errorMsg }}
                </div>
                <div
                    v-if="successMsg"
                    class="p-3 bg-green-500/10 border border-mtg-green text-mtg-green rounded-lg mt-2 text-sm"
                >
                    <Icon
                        name="mdi:check-circle-outline"
                        class="mr-1 h-4 w-4 inline-block -mt-1"
                    />
                    {{ successMsg }}
                </div>

                <div
                    class="flex justify-end pt-4 border-t border-border-color mt-4"
                >
                    <BaseButton
                        type="submit"
                        variant="primary"
                        icon="mdi:content-save"
                        :disabled="isSaving"
                    >
                        <span v-if="isSaving">Saving...</span>
                        <span v-else>Save Profile</span>
                    </BaseButton>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";

const db = useDb();
const user = useSupabaseUser();

const isLoading = ref(true);
const isSaving = ref(false);
const displayName = ref("");
const friendCode = ref("");
const errorMsg = ref("");
const successMsg = ref("");
const copied = ref(false);

const generateFriendCode = (name) => {
    const base = name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 10);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `${base}#${randomDigits}`;
};

const copyFriendCode = async () => {
    try {
        await navigator.clipboard.writeText(friendCode.value);
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 3000);
    } catch (err) {
        console.error("Failed to copy", err);
    }
};

const saveProfile = async () => {
    isSaving.value = true;
    errorMsg.value = "";
    successMsg.value = "";
    try {
        if (!friendCode.value) {
            friendCode.value = generateFriendCode(
                displayName.value || "Player",
            );
        }
        await db.upsertProfile(displayName.value, friendCode.value);
        successMsg.value = "Profile saved successfully!";
    } catch (err) {
        console.error(err);
        if (err.code === "23505") {
            // Unique violation for friend code
            errorMsg.value =
                "Friend code somehow generated a collision. Try saving again.";
            friendCode.value = generateFriendCode(
                displayName.value || "Player",
            );
        } else {
            errorMsg.value = err.message || "An error occurred while saving.";
        }
    } finally {
        isSaving.value = false;
    }
};

const loadProfile = async () => {
    if (!user.value) return;
    try {
        const profile = await db.getProfile();
        if (profile) {
            displayName.value = profile.display_name;
            friendCode.value = profile.friend_code;
        } else {
            // New user, wait for them to generate/save. Default to email name.
            if (user.value?.email) {
                displayName.value = user.value.email.split("@")[0];
            }
        }
    } catch (err) {
        console.error("Error loading profile", err);
    } finally {
        isLoading.value = false;
    }
};

watch(
    user,
    (newUser) => {
        if (newUser) {
            loadProfile();
        }
    },
    { immediate: true },
);
</script>
