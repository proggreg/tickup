<script setup lang="ts">
const supabase = serverSupaBaseClient()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const login = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please enter email and password'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    
    if (signInError) {
      error.value = signInError.message
    } else {
      await navigateTo('/')
    }
  } catch (err) {
    error.value = 'An error occurred during login'
  } finally {
    loading.value = false
  }
}

const loginWithGoogle = async () => {
  const { error: signInError } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`
    }
  })
  
  if (signInError) {
    error.value = signInError.message
  }
}
</script>

<template>
  <div style="max-width: 400px" class="flex-1 mx-auto">
    <v-form @submit.prevent="login">
      <v-text-field
        v-model="email"
        label="Email"
        type="email"
        required
        class="mb-3"
      />
      
      <v-text-field
        v-model="password"
        label="Password"
        type="password"
        required
        class="mb-3"
      />
      
      <v-alert v-if="error" type="error" class="mb-3">
        {{ error }}
      </v-alert>
      
      <v-btn 
        :loading="loading"
        class="mb-3" 
        color="primary" 
        block 
        type="submit"
      >
        Login
      </v-btn>
      
      <v-btn 
        class="mb-4" 
        color="secondary" 
        variant="outlined"
        block 
        @click="loginWithGoogle"
      >
        Login with Google
      </v-btn>
    </v-form>
    
    <div class="text-center">
      <span>Don't have an account? </span>
      <NuxtLink to="/register">Register</NuxtLink>
    </div>
  </div>
</template>
