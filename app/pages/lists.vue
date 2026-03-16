<script setup lang="ts">
definePageMeta({
    layout: 'mobile',
});

const store = useListsStore();
const editingId = ref<string | null>(null);

function finishRename(item: List) {
    store.updateList(item);
    editingId.value = null;
}

onBeforeMount(() => {
    store.getLists();
});
</script>

<template>
    <div class="mobile-lists-page">
        <div class="page-header">
            <h1 class="page-title">
                My Lists
            </h1>
            <span
                v-if="store.lists.length"
                class="lists-count-badge"
            >
                {{ store.lists.length }}
            </span>
        </div>

        <div
            v-if="store.lists.length === 0"
            class="empty-state"
        >
            <v-icon
                icon="mdi-playlist-plus"
                size="56"
                class="empty-icon"
            />
            <p class="empty-title">
                No lists yet
            </p>
            <p class="empty-subtitle">
                Tap the button below to create your first list
            </p>
        </div>

        <div
            v-else
            class="lists-wrapper"
        >
            <TransitionGroup name="list-item">
                <div
                    v-for="item in store.lists"
                    :key="item.id"
                    class="list-card"
                >
                    <div
                        v-if="editingId === item.id"
                        class="list-card-inner"
                    >
                        <div class="list-icon-wrap">
                            <v-icon
                                :icon="item.icon || 'mdi-format-list-bulleted'"
                                size="18"
                            />
                        </div>
                        <v-text-field
                            v-model="item.name"
                            autofocus
                            variant="plain"
                            hide-details
                            class="list-rename-input"
                            @keyup.enter="finishRename(item)"
                            @blur="finishRename(item)"
                        />
                    </div>

                    <NuxtLink
                        v-else
                        :to="`/list/${item.id}`"
                        class="list-card-inner list-card-link"
                    >
                        <div class="list-icon-wrap">
                            <v-icon
                                :icon="item.icon || 'mdi-format-list-bulleted'"
                                size="18"
                            />
                        </div>
                        <span class="list-name">{{ item.name }}</span>
                        <div class="list-meta">
                            <span
                                v-if="item.todos?.length"
                                class="todo-badge"
                            >
                                {{ item.todos.length }}
                            </span>
                            <ListMenu :list-id="item.id" />
                        </div>
                    </NuxtLink>
                </div>
            </TransitionGroup>
        </div>

        <ListNew />
    </div>
</template>

<style scoped>
.mobile-lists-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-bottom: 80px;
    overflow: hidden;
}

.page-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 32px 20px 16px;
    flex-shrink: 0;
}

.page-title {
    font-size: 1.85rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    margin: 0;
    line-height: 1.1;
}

.lists-count-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    border-radius: 12px;
    background: rgba(128, 128, 128, 0.15);
    font-size: 0.78rem;
    font-weight: 600;
    opacity: 0.8;
}

.lists-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 4px 16px 16px;
}

.list-card {
    border-radius: 16px;
    margin-bottom: 8px;
    background: rgba(128, 128, 128, 0.07);
    transition: background 0.12s ease;
}

.list-card:active {
    background: rgba(128, 128, 128, 0.14);
}

.list-card-inner {
    display: flex;
    align-items: center;
    padding: 13px 8px 13px 14px;
    gap: 12px;
    min-height: 62px;
}

.list-card-link {
    text-decoration: none;
    color: inherit;
}

.list-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(128, 128, 128, 0.13);
    flex-shrink: 0;
}

.list-name {
    flex: 1;
    font-size: 1rem;
    font-weight: 600;
    text-transform: capitalize;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.list-meta {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
}

.todo-badge {
    font-size: 0.78rem;
    font-weight: 600;
    opacity: 0.5;
    min-width: 20px;
    text-align: center;
    padding-right: 2px;
}

.list-rename-input {
    flex: 1;
}

.list-rename-input :deep(input) {
    font-size: 1rem;
    font-weight: 600;
    padding: 0;
    text-transform: capitalize;
}

.empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 32px;
    text-align: center;
}

.empty-icon {
    opacity: 0.2;
    margin-bottom: 8px;
}

.empty-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    opacity: 0.6;
}

.empty-subtitle {
    font-size: 0.875rem;
    margin: 0;
    opacity: 0.4;
    line-height: 1.5;
}

.list-item-enter-active,
.list-item-leave-active {
    transition: all 0.22s ease;
}

.list-item-enter-from {
    opacity: 0;
    transform: translateY(-6px);
}

.list-item-leave-to {
    opacity: 0;
    transform: translateX(16px);
}
</style>
