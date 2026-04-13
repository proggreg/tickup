<script setup lang="ts">
const listsStore = useListsStore();
const tabs = ref<View[]>(['board', 'list']);
const currentTab = ref<View>('list');
watch(currentTab, (newTab) => {
    listsStore.setView(newTab);
});
</script>

<template>
    <div class="complex-list">
        <div class="tab-bar">
            <button
                v-for="tab in tabs"
                :key="tab"
                class="tab-btn"
                :class="{ 'tab-btn--active': currentTab === tab }"
                @click="currentTab = tab"
            >
                {{ tab }}
            </button>
        </div>

        <div
            v-show="currentTab === 'board'"
            class="tab-panel"
        >
            <Board />
        </div>
        <div
            v-show="currentTab === 'list'"
            class="tab-panel"
        >
            <ListTable />
        </div>
    </div>
</template>

<style scoped>
.complex-list {
    display: flex;
    flex-direction: column;
}

.tab-bar {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
    margin-bottom: 16px;
}

.tab-btn {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.6);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    text-transform: capitalize;
    transition: color 0.15s, border-color 0.15s;
}

.tab-btn:hover {
    color: rgb(var(--v-theme-on-surface));
}

.tab-btn--active {
    color: rgb(var(--v-theme-primary));
    border-bottom-color: rgb(var(--v-theme-primary));
}
</style>
