<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-primary">
    <div class="w-full max-w-[400px] p-8 card">
      <div class="text-center mb-8">
        <img src="/favicon.png" alt="Arcane Ledger Logo" class="w-14 h-14 rounded-lg mx-auto mb-2" />
        <h2 class="text-2xl mb-2 font-bold">{{ isSignUp ? 'Create an Account' : 'Welcome Back' }}</h2>
        <p class="text-muted">
          {{ isSignUp ? 'Sign up to track your Commander games' : 'Sign in to access your dashboard' }}
        </p>
      </div>

      <form @submit.prevent="handleAuth">
        <div class="form-group mb-6">
          <label class="form-label" for="email">Email</label>
          <input 
            id="email" 
            v-model="email" 
            type="email" 
            class="form-input" 
            placeholder="your@email.com" 
            required 
            :disabled="isLoading"
          />
        </div>

        <div class="form-group mb-8">
          <label class="form-label" for="password">Password</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            class="form-input" 
            placeholder="••••••••" 
            required 
            :disabled="isLoading"
          />
        </div>

        <div v-if="errorMsg" class="text-red-500 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20 mb-6">
          {{ errorMsg }}
        </div>
        
        <div v-if="successMsg" class="text-emerald-500 text-sm bg-emerald-500/10 p-3 rounded-md border border-emerald-500/20 mb-6">
          {{ successMsg }}
        </div>

        <button type="submit" class="btn btn-primary w-full flex justify-center mb-4" :disabled="isLoading">
          <Icon v-if="isLoading" name="mdi:loading" class="animate-spin mr-2" />
          {{ isSignUp ? 'Sign Up' : 'Sign In' }}
        </button>
      </form>

      <div class="text-center mt-4">
        <p class="text-sm text-muted">
          {{ isSignUp ? 'Already have an account?' : 'Don\'t have an account?' }}
          <button type="button" class="bg-transparent border-none text-accent-primary font-medium cursor-pointer p-0 hover:underline" @click="toggleMode" :disabled="isLoading">
            {{ isSignUp ? 'Sign In' : 'Sign Up' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Avoid requiring layout wraps for login to prevent unauthorized layout issues
definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()
const router = useRouter()

const email = ref('')
const password = ref('')
const isSignUp = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const toggleMode = () => {
  isSignUp.value = !isSignUp.value
  errorMsg.value = ''
  successMsg.value = ''
}

const handleAuth = async () => {
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  try {
    if (isSignUp.value) {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      successMsg.value = 'Check your email for the confirmation link!'
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      // Redirect to dashboard on success
      router.push('/')
    }
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    isLoading.value = false
  }
}
</script>
