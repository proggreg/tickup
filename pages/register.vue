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
    <AppRegisterForm />
</template>