<script setup lang="ts">
definePageMeta({ layout: 'chat' });
</script>

<template>
    <div class="chat-page">
        <Chat />
    </div>
</template>

<style scoped>
.chat-page {
    height: calc(100dvh - var(--v-layout-top) - var(--v-layout-bottom));
    padding: 24px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
</style>
