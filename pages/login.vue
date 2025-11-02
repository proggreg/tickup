<script setup lang="ts">
  definePageMeta({
    layout: 'login'
  })
  const config = useRuntimeConfig()
  const supabase = useSupabaseClient()
  const email = ref('')
  const BASE_URL = config.public.VERCEL_URL ?? 'https://localhost:3000' 
  console.log('Base url', BASE_URL)
  console.log('public', config.public)
  console.log('redirect to', `${BASE_URL}/confirm`)

  const signInWithOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: `${BASE_URL}/confirm`,
      }
    })
    if (error) console.log(error)
  }
</script>
<template>
  <div>
    <v-text-field v-model="email" />
    <v-btn  @click="signInWithOtp">
      Sign In with E-Mail
    </v-btn>

  </div>
</template>
