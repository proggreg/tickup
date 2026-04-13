<script setup lang="ts">
const statusStore = useSettingsStore();
</script>

<template>
    <div class="board-container">
        <div class="board-row">
            <div
                v-for="status in statusStore.statuses"
                :key="status.name"
                class="board-col"
            >
                <BoardColumn :status="status" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.board-row {
    display: flex;
    flex-direction: row;
    height: 100%;
    gap: 0;
}

.board-col {
    display: flex;
    flex: 1;
    min-width: 0;
}
</style>
