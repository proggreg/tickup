<script setup lang="ts">
const statusStore = useSettingsStore();

const boardRef = ref<HTMLElement | null>(null);
</script>

<template>
    <v-slide-group
        ref="boardRef"
        :show-arrows="true"
        class="font-weight-bold"
    >
        <v-slide-group-item
            v-for="status in statusStore.statuses"
            :key="status.name"
        >
            <BoardColumn
                :status="status"
            />
        </v-slide-group-item>
    </v-slide-group>
</template>

<style scoped>
</style>
