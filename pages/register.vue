<script setup lang="ts">
definePageMeta({
  layout: 'login-register',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
})
</script>

<template>
  <v-row width="400">
    <v-col class="justify-center" cols="12">
      <v-img class="mx-auto rounded-xl" width="100" src="/tickup-logo.png" />
    </v-col>
    <v-col cols="12">
      <AppRegisterForm />
    </v-col>
  </v-row>
</template>
