<script setup lang="ts">
definePageMeta({
    layout: 'default',
});
useHead({ title: 'TickUp:Home' });

const { mdAndUp } = useDisplay();
</script>

<template>
    <!-- Desktop: Ledger dashboard (KPI cards + 8/4 col layout) -->
    <HomePageLedgerDashboard v-if="mdAndUp" />

    <!-- Mobile: bento grid + vertical sections + bottom nav -->
    <HomePageMobileDashboard v-else />
</template>
