<script setup lang="ts">
definePageMeta({
    title: 'Account',
    description: 'Account page',
    layout: 'settings'
})

const { signOut, data } = useAuth()
</script>
<template>
    <div class="d-flex flex-column">
        My Account
        <v-btn class="my-auto" @click="signOut">Logout</v-btn>
    </div>
</template>