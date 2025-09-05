<script setup lang="ts">
useHead({ title: 'TickUp - Login' })
</script>

<template>
  <v-row>
    <v-col class="justify-center" cols="12">
      <v-img class="mx-auto rounded-xl" width="100" src="/tickup-logo.png" />
    </v-col>
    <v-col cols="12">
      <AppLoginForm />
    </v-col>
  </v-row>
</template>
