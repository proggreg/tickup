<script setup lang="ts">
useHead({ title: 'TickUp:Home' });

const { mdAndUp } = useDisplay();
</script>

<template>
    <!-- Desktop dashboard -->
    <HomePageDashboard v-if="mdAndUp" />

    <!-- Mobile dashboard -->
    <HomePageMobile v-else />
</template>
