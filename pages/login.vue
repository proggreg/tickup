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
      <v-btn
        append-icon="mdi-github"
        @click="signIn(`github`, { callbackUrl: 'http://localhost:3000/api/auth/callback/github'})"
      >
        Github Sign In
      </v-btn>
    </div>
  </div>
</template>