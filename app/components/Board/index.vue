<script setup lang="ts">
const statusStore = useSettingsStore();
</script>

<template>
    <div class="board-container">
        <v-row
            class="board-row"
            no-gutters
        >
            <v-col
                v-for="status in statusStore.statuses"
                :key="status.name"
                class="board-col"
            >
                <BoardColumn :status="status" />
            </v-col>
        </v-row>
    </div>
</template>

<style scoped>
.board-row {
  height: 100%;
}

.board-col {
  display: flex;
}
</style>
