<script setup lang="ts">
  definePageMeta({
    layout: 'login'
  })
  const config = useRuntimeConfig()
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const email = ref('')
  const password = ref('')
  const BASE_URL = config.public.VERCEL_URL ?? 'localhost:3000' 
  console.log('Base url', BASE_URL)
  console.log('public', config.public)
  console.log('redirect to', `https://${BASE_URL}/confirm`)

  watchEffect(() => {
    if (user.value) {
      return navigateTo('/')
    }
  })

  const signInWithOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: `${BASE_URL}/confirm`,
      }
    })
    if (error) console.log(error)
  }

  function signInWithPassword() {
    supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
  }

  function signUpWithPassword() {
    supabase.auth.signUp({
      email: email.value,
      password: password.value
    })
  }
</script>
<template>
  <div>
    <v-text-field v-model="email" placeholder="email" />
    <v-text-field v-model="password" type="password" placeholder="password" />
    <v-btn  @click="signInWithPassword">
      Sign In with E-Mail
    </v-btn>
    <v-btn  @click="signUpWithPassword">
      Sign Up with E-Mail
    </v-btn>

  </div>
</template>
