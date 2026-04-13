<script setup lang="ts">
import { ListSimple } from '#components';
import type { ViewType } from '~/types/table-item.types';

const listsStore = useListsStore();
const tabs = ref<ViewType[]>(['board', 'list']);
const currentTab = ref<ViewType>('list');
const on = useToolbar();

onBeforeMount(async () => {
    await listsStore.getCurrentList();

    const defaultView = listsStore.currentList?.defaultView as ViewType | undefined;
    if (defaultView && tabs.value.includes(defaultView)) {
        currentTab.value = defaultView;
    }
});

if (!listsStore.currentList) {
    navigateTo('/');
}

if (listsStore.currentList) {
    useHead({
        title: `TickUp:${listsStore.currentList.name}`,
    });
}

watch(listsStore.currentList.todos, (todos: Todo[]) => {
    if (!todos) return;
    on.value = todos.filter((todo: Todo) => todo.selected).length > 0;
});

function updateListType(listType) {
    console.log('updateListType', listType);
    listsStore.currentList.listType = listType;
    listsStore.updateList();
}
</script>

<template>
    <div class="list-page">
        <ListHeader />

        <div class="list-body">
            <!-- Tab bar -->
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

            <!-- Board tab -->
            <div
                v-show="currentTab === 'board'"
                class="tab-panel"
            >
                <Board />
            </div>

            <!-- List tab -->
            <div
                v-show="currentTab === 'list'"
                class="tab-panel"
            >
                <div class="list-toolbar">
                    <div class="list-toolbar__new">
                        <TodoNew />
                    </div>
                    <div class="list-toolbar__type">
                        <ListType
                            :current-list-type="listsStore.currentList.listType"
                            @list-type-updated="(listType) => updateListType(listType)"
                        />
                    </div>
                </div>
                <ListTable v-if="listsStore.currentList.listType === 'table'" />
                <ListSimple v-else />
            </div>
        </div>
    </div>
</template>

<style scoped>
.list-page {
    display: flex;
    flex-direction: column;
    min-height: 100%;
}

.list-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 16px 16px;
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

.tab-panel {
    flex: 1;
}

.list-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.list-toolbar__new {
    flex: 1;
}

.list-toolbar__type {
    flex-shrink: 0;
}
</style>
