<script setup lang="ts">
definePageMeta({
  layout: 'login-register',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  }
})

</script>

<template>
  <AppLoginForm />
</template>