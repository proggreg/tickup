<script setup lang="ts">
const { signIn, status } = useAuth()
definePageMeta({
  layout: 'login',
  auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/',
    }
})
const loggedIn = computed(() => status.value === 'authenticated')
// if (loggedIn.value) {
//   navigateTo('/')
// }
</script>

<template>
  <div>
    <div>
      <v-btn
        append-icon="mdi-github"
        @click="signIn(`github`)"
      >
        Github Sign In
      </v-btn>
    </div>
  </div>
</template>