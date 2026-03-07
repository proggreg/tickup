<script setup lang="ts">
definePageMeta({
    auth: {
        unauthenticatedOnly: false,
        navigateUnauthenticatedTo: '/login',
    },
});
</script>

<template>
    <div
        class="d-flex flex-column"
    >
        <div class="pa-4">
            <Search />
        </div>

        <SearchResults :disable-status-button="true" />
    </div>
</template>
