<template>
  <div class="login-page">
    <div class="login-container card">
      <div class="text-center mb-6">
        <Icon name="mdi:cards-playing" class="logo-icon mb-2" />
        <h2 class="page-title">{{ isSignUp ? 'Create an Account' : 'Welcome Back' }}</h2>
        <p class="text-muted">
          {{ isSignUp ? 'Sign up to track your Commander games' : 'Sign in to access your dashboard' }}
        </p>
      </div>

      <form @submit.prevent="handleAuth">
        <div class="form-group mb-4">
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

        <div class="form-group mb-6">
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

        <div v-if="errorMsg" class="error-message mb-4">
          {{ errorMsg }}
        </div>
        
        <div v-if="successMsg" class="success-message mb-4">
          {{ successMsg }}
        </div>

        <button type="submit" class="btn btn-primary w-full justify-center mb-4" :disabled="isLoading">
          <Icon v-if="isLoading" name="mdi:loading" class="spin-icon mr-2" />
          {{ isSignUp ? 'Sign Up' : 'Sign In' }}
        </button>
      </form>

      <div class="text-center mt-4">
        <p class="text-sm text-muted">
          {{ isSignUp ? 'Already have an account?' : 'Don\'t have an account?' }}
          <button type="button" class="btn-link" @click="toggleMode" :disabled="isLoading">
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

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: var(--bg-primary);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.logo-icon {
  font-size: 3rem;
  color: var(--accent-primary);
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mb-6 {
  margin-bottom: 2rem;
}

.w-full {
  width: 100%;
}

.justify-center {
  display: flex;
  justify-content: center;
}

.text-center {
  text-align: center;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  background-color: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.success-message {
  color: #10b981;
  font-size: 0.875rem;
  background-color: rgba(16, 185, 129, 0.1);
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.btn-link {
  background: none;
  border: none;
  color: var(--accent-primary);
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}

.btn-link:hover {
  text-decoration: underline;
}
</style>
