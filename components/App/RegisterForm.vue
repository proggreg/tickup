<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const register = async () => {
  if (!email.value || !password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    
    if (signUpError) {
      error.value = signUpError.message
    } else {
      await navigateTo('/')
    }
  } catch (err) {
    error.value = 'An error occurred during registration'
  } finally {
    loading.value = false
  }
}

const registerWithGoogle = async () => {
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
    <v-form @submit.prevent="register">
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
      
      <v-text-field
        v-model="confirmPassword"
        label="Confirm Password"
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
        Register
      </v-btn>
      
      <v-btn 
        class="mb-4" 
        color="secondary" 
        variant="outlined"
        block 
        @click="registerWithGoogle"
      >
        Register with Google
      </v-btn>
    </v-form>
    
    <div class="text-center">
      <span>Already a user? </span>
      <NuxtLink color="secondary" to="/login">Login</NuxtLink>
    </div>
  </div>
</template>
