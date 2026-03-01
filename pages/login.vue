<template>
    <div class="min-h-screen flex items-center justify-center p-4 bg-primary">
        <div class="w-full max-w-[400px] p-8 card">
            <div class="text-center mb-8">
                <div class="relative inline-block mb-4">
                    <div
                        class="absolute inset-0 bg-accent-primary/30 blur-2xl rounded-full scale-[1.75]"
                    ></div>
                    <img
                        src="/favicon.png"
                        alt="Arcane Ledger Logo"
                        class="relative w-20 h-20 rounded-lg mx-auto drop-shadow-xl transform transition-transform hover:scale-105 duration-300"
                    />
                </div>
                <h2 class="text-2xl mb-2 font-bold">
                    {{ isSignUp ? "Create an Account" : "Welcome Back" }}
                </h2>
                <p class="text-muted">
                    {{
                        isSignUp
                            ? "Sign up to track your Commander games"
                            : "Sign in to access your dashboard"
                    }}
                </p>
            </div>

            <form @submit.prevent="handleAuth">
                <div class="form-group mb-6">
                    <label class="form-label" for="email">Email</label>
                    <BaseInput
                        id="email"
                        v-model="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        :disabled="isLoading"
                    />
                </div>

                <div class="form-group mb-8">
                    <label class="form-label" for="password">Password</label>
                    <BaseInput
                        id="password"
                        v-model="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        :disabled="isLoading"
                    />
                </div>

                <div
                    v-if="errorMsg"
                    class="text-red-500 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20 mb-6"
                >
                    {{ errorMsg }}
                </div>

                <div
                    v-if="successMsg"
                    class="text-emerald-500 text-sm bg-emerald-500/10 p-3 rounded-md border border-emerald-500/20 mb-6"
                >
                    {{ successMsg }}
                </div>

                <button
                    type="submit"
                    class="btn btn-primary w-full flex justify-center mb-4"
                    :disabled="isLoading"
                >
                    <Icon
                        v-if="isLoading"
                        name="mdi:loading"
                        class="animate-spin mr-2"
                    />
                    {{ isSignUp ? "Sign Up" : "Sign In" }}
                </button>
            </form>

            <div v-if="allowSignUp" class="text-center mt-4">
                <p class="text-sm text-muted">
                    {{
                        isSignUp
                            ? "Already have an account?"
                            : "Don't have an account?"
                    }}
                    <button
                        type="button"
                        class="bg-transparent border-none text-accent-primary font-medium cursor-pointer p-0 hover:underline"
                        @click="toggleMode"
                        :disabled="isLoading"
                    >
                        {{ isSignUp ? "Sign In" : "Sign Up" }}
                    </button>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";

// Avoid requiring layout wraps for login to prevent unauthorized layout issues
definePageMeta({
    layout: false,
});

const supabase = useSupabaseClient();
const router = useRouter();

const email = ref("");
const password = ref("");
const isSignUp = ref(false);
const allowSignUp = ref(false); // Temporarily disabled for production launch
const isLoading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

const toggleMode = () => {
    isSignUp.value = !isSignUp.value;
    errorMsg.value = "";
    successMsg.value = "";
};

const handleAuth = async () => {
    isLoading.value = true;
    errorMsg.value = "";
    successMsg.value = "";

    try {
        if (isSignUp.value) {
            if (!allowSignUp.value) {
                errorMsg.value = "Sign ups are currently disabled.";
                return;
            }
            const { error } = await supabase.auth.signUp({
                email: email.value,
                password: password.value,
            });
            if (error) throw error;
            successMsg.value = "Check your email for the confirmation link!";
            email.value = "";
            password.value = "";
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.value,
                password: password.value,
            });
            if (error) throw error;
            // Redirect to dashboard on success
            router.push("/");
        }
    } catch (error) {
        errorMsg.value = error.message;
    } finally {
        isLoading.value = false;
    }
};
</script>
