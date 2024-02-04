<script setup lang="ts">
definePageMeta({
    layout: 'login',
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/',
    }
})

</script>

<template>
    <AppRegisterForm />
</template>