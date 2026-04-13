<script setup lang="ts">
definePageMeta({ layout: 'chat' });
</script>

<template>
    <div class="chat-page">
        <!-- <Chat /> -->
    </div>
</template>

<style scoped>
.chat-page {
    width: 100%;
    height: calc(100dvh - 64px);
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    box-sizing: border-box;
    overflow: hidden;
}
</style>
