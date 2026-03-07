<script setup lang="ts">
const { userId: _userId } = useCurrentUser();
const modelValue = defineModel<string>({ default: 'todo' });
const listsStore = useListsStore();

watch(() => modelValue.value, (_newTab) => {
    listsStore.getTodaysTodos?.();
});

onBeforeMount(() => {
    listsStore.getTodaysTodos();
});
</script>

<template>
    <div class="d-flex justify-center mb-4 px-4">
        <div class="pill-tabs-container pa-1">
            <v-btn-toggle
                v-model="modelValue"
                mandatory
                density="comfortable"
                class="pill-tabs"
            >
                <v-btn
                    value="overdue"
                    class="pill-tab-btn"
                    :class="{ 'pill-tab-btn--active': modelValue === 'overdue' }"
                    rounded="pill"
                    size="small"
                    variant="text"
                >
                    Overdue
                </v-btn>
                <v-btn
                    value="todo"
                    class="pill-tab-btn"
                    :class="{ 'pill-tab-btn--active': modelValue === 'todo' }"
                    rounded="pill"
                    size="small"
                    variant="text"
                >
                    Todo
                </v-btn>
                <v-btn
                    value="done"
                    class="pill-tab-btn"
                    :class="{ 'pill-tab-btn--active': modelValue === 'done' }"
                    rounded="pill"
                    size="small"
                    variant="text"
                >
                    Done
                </v-btn>
            </v-btn-toggle>
        </div>
    </div>
</template>

<style scoped>
.pill-tabs-container {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50px;
    display: inline-flex;
}

.pill-tabs {
    background: transparent !important;
    gap: 2px;
    height: auto !important;
}

.pill-tab-btn {
    border-radius: 50px !important;
    min-width: 100px !important;
    font-size: 1rem !important;
    font-weight: 500 !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
    opacity: 0.6;
    transition: opacity 0.2s, background 0.2s;
}

.pill-tab-btn--active {
    background: rgba(255, 255, 255, 0.15) !important;
    opacity: 1 !important;
}
</style>
