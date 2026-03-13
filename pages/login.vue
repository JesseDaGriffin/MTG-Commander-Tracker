<template>
    <div
        class="fixed inset-0 flex items-center justify-center p-4 bg-primary overflow-hidden"
    >
        <!-- Animated Background Elements -->
        <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div
                class="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent-primary/10 rounded-full blur-[120px] animate-blob"
            ></div>
            <div
                class="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-mtg-blue/10 rounded-full blur-[150px] animate-blob animation-delay-2000"
            ></div>
            <div
                class="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-mtg-red/5 rounded-full blur-[100px] animate-blob animation-delay-4000"
            ></div>
        </div>

        <div
            class="relative z-10 w-full max-w-[420px] p-8 card glass border border-white/10 shadow-2xl max-h-full overflow-y-auto animate-fade-in-up"
        >
            <div class="text-center mb-8">
                <div class="relative inline-block mb-6 animate-float">
                    <div
                        class="absolute inset-0 bg-accent-primary/50 blur-[30px] rounded-full scale-[1.5] animate-pulse-slow"
                    ></div>
                    <img
                        src="/favicon.png"
                        alt="Arcane Ledger Logo"
                        class="relative w-24 h-24 rounded-2xl mx-auto drop-shadow-2xl border border-white/10 shadow-[0_0_20px_rgba(14,165,233,0.4)] transform transition-transform hover:scale-105 duration-300"
                    />
                </div>
                <h1
                    class="text-3xl sm:text-4xl font-black mb-3 tracking-tight bg-gradient-to-r from-accent-primary via-white to-accent-primary bg-clip-text text-transparent drop-shadow-md"
                >
                    Arcane Ledger
                </h1>
                <h2 class="text-lg mb-2 font-medium text-text-primary/90">
                    {{ isSignUp ? "Create an Account" : "Welcome Back" }}
                </h2>
                <p class="text-sm text-text-muted">
                    {{
                        isSignUp
                            ? "Sign up to track your Commander games"
                            : "Sign in to access your dashboard"
                    }}
                </p>
            </div>

            <form @submit.prevent="handleAuth" class="relative z-10">
                <div v-if="isSignUp" class="form-group mb-6 animate-fade-in-up">
                    <label class="form-label" for="displayName"
                        >Display Name</label
                    >
                    <BaseInput
                        id="displayName"
                        v-model="displayName"
                        type="text"
                        placeholder="Your display name"
                        :required="isSignUp"
                        :disabled="isLoading"
                        class="bg-bg-tertiary/50 backdrop-blur-sm"
                    />
                </div>

                <div class="form-group mb-6">
                    <label class="form-label" for="email">Email</label>
                    <BaseInput
                        id="email"
                        v-model="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        :disabled="isLoading"
                        class="bg-bg-tertiary/50 backdrop-blur-sm"
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
                        class="bg-bg-tertiary/50 backdrop-blur-sm"
                    />
                </div>

                <div
                    v-if="errorMsg"
                    class="text-red-400 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20 mb-6 backdrop-blur-md"
                >
                    {{ errorMsg }}
                </div>

                <div
                    v-if="successMsg"
                    class="text-emerald-400 text-sm bg-emerald-500/10 p-3 rounded-md border border-emerald-500/20 mb-6 backdrop-blur-md"
                >
                    {{ successMsg }}
                </div>

                <BaseButton
                    type="submit"
                    variant="primary"
                    customClass="w-full flex justify-center mb-4 py-3 text-lg font-bold shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-shadow"
                    :disabled="isLoading"
                    :loading="isLoading"
                >
                    {{ isSignUp ? "Sign Up" : "Sign In" }}
                </BaseButton>

                <div v-if="isSignUp" class="text-center mt-2 mb-2">
                    <button
                        type="button"
                        class="text-sm text-accent-primary hover:text-accent-hover hover:underline transition-colors bg-transparent border-none cursor-pointer"
                        @click="handleResend"
                        :disabled="isLoading"
                    >
                        Already attempted to sign up? Resend email
                    </button>
                </div>
            </form>

            <div v-if="allowSignUp" class="text-center mt-4 relative z-10">
                <p class="text-sm text-muted">
                    {{
                        isSignUp
                            ? "Already have an account?"
                            : "Don't have an account?"
                    }}
                    <button
                        type="button"
                        class="bg-transparent border-none text-accent-primary font-medium cursor-pointer p-0 hover:text-accent-hover hover:underline transition-colors block mx-auto mt-2"
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
const displayName = ref("");
const isSignUp = ref(false);
const allowSignUp = ref(true); // Toggle to false to disable signups
const isLoading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

const toggleMode = () => {
    isSignUp.value = !isSignUp.value;
    errorMsg.value = "";
    successMsg.value = "";
    displayName.value = "";
};

const handleResend = async () => {
    if (!email.value) {
        errorMsg.value = "Please enter your email to resend the confirmation.";
        return;
    }
    isLoading.value = true;
    errorMsg.value = "";
    successMsg.value = "";

    try {
        const { error } = await supabase.auth.resend({
            type: "signup",
            email: email.value,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });
        if (error) throw error;
        successMsg.value = "Confirmation email resent! Check your inbox.";
        password.value = "";
    } catch (error) {
        errorMsg.value = error.message;
    } finally {
        isLoading.value = false;
    }
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
                options: {
                    data: {
                        display_name: displayName.value,
                    },
                    emailRedirectTo: window.location.origin,
                },
            });
            if (error) throw error;
            successMsg.value = "Check your email for the confirmation link!";
            email.value = "";
            password.value = "";
            displayName.value = "";
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
