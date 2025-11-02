<script setup lang="ts">
definePageMeta({
  layout: 'login'
})
const supabase = useSupabaseClient()
const email = ref('')

const signInWithOtp = async () => {
  if (!email.value) {

    return
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: 'http://localhost:3000/confirm',
    }
  })
  if (error) console.log(error)
}
</script>
<template>
  <div>
    {{ email }}
    <v-text-field v-model="email" />
    <v-btn  @click="signInWithOtp">
      Sign In with E-Mail
    </v-btn>

  </div>
</template>
