<script setup lang="ts">
  useHead({ title: 'TickUp - Login' })
  definePageMeta({
    layout: 'login',
    auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/' }
  })
</script>

<template>
  <v-row>
    <v-col class="justify-center" cols="12">
      <v-img class="mx-auto rounded-xl" width="100" src="/android-chrome-512x512.png" />
    </v-col>
    <v-col cols="12">
      <AppLoginForm />
    </v-col>
  </v-row>
</template>
