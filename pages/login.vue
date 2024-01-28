<script setup lang="ts">
const { signIn } = useAuth()
definePageMeta({
  layout: 'login',
  auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/',
    }
})

</script>

<template>
  <div>
    <div>
      <AppLoginForm />
      <v-btn
        append-icon="mdi-github"
        @click="signIn(`github`, { callbackUrl: 'http://localhost:3000/'})"
      >
        Github Sign In
      </v-btn>
    </div>
  </div>
</template>