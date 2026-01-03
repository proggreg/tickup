<script setup lang="ts">
const statusStore = useSettingsStore();
// const { $device } = useNuxtApp();
const dragging = ref(false);
const listStore = useListsStore();

const boardRef = ref<HTMLElement | null>(null);

const cardHeight = computed(() => {
    const boardElement = boardRef.value;
    const parentElement = boardElement?.parentElement;
    const parentHeight = parentElement ? parentElement.clientHeight : window.innerHeight;
    return (parentHeight - 30) + 'px';
});

const cardWidth = computed(() => {
    const boardElement = boardRef.value;
    const parentElement = boardElement?.parentElement;
    const parentWidth = parentElement ? parentElement.clientWidth : window.innerWidth;
    return (parentWidth / 10) + 'px';
});

watch(dragging, (isDragging: boolean) => {
    if (isDragging) {
        document.body.style.cursor = 'grabbing';
    }
    else {
        document.body.style.cursor = 'auto';
    }
});
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
                :card-height="cardHeight"
                :card-width="cardWidth"
            />
        </v-slide-group-item>
    </v-slide-group>
</template>

<style scoped>
</style>
