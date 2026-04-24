<script setup lang="ts">
definePageMeta({
    layout: 'mobile',
});

const store = useListsStore();

onBeforeMount(() => {
    store.getLists();
});
</script>

<template>
    <div class="lists-page">
        <div class="lists-page__header">
            <span class="lists-page__title">My Lists</span>
            <span
                v-if="store.lists.length"
                class="lists-badge"
            >
                {{ store.lists.length }}
            </span>
        </div>

        <div
            v-if="store.lists.length === 0"
            class="lists-page__empty"
        >
            <i class="mdi mdi-playlist-plus empty-icon" />
            <p class="empty-title">
                No lists yet
            </p>
            <p class="empty-subtitle">
                Tap the button below to create your first list
            </p>
        </div>

        <ul
            v-else
            class="lists-list"
        >
            <li
                v-for="item in store.lists"
                :key="item.id"
                class="list-item"
            >
                <NuxtLink
                    :to="`/list/${item.id}`"
                    class="list-item__link"
                >
                    <i
                        :class="`mdi ${item.icon || 'mdi-format-list-bulleted'} list-item__icon`"
                    />
                    <span class="list-item__name">{{ item.name }}</span>
                    <div class="list-item__append">
                        <span
                            v-if="item.todos?.length"
                            class="list-item__count"
                        >
                            {{ item.todos.length }}
                        </span>
                        <ListMenu :list-id="item.id" />
                    </div>
                </NuxtLink>
            </li>
        </ul>

        <ListNew />
    </div>
</template>

<style scoped>
.lists-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-bottom: 80px;
}

.lists-page__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 32px 20px 16px;
    flex-shrink: 0;
}

.lists-page__title {
    font-size: 1.5rem;
    font-weight: 700;
}

.lists-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    background: rgba(var(--v-border-color), 0.1);
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.lists-page__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 32px;
    text-align: center;
}

.empty-icon {
    font-size: 56px;
    color: rgba(var(--v-theme-on-surface), 0.3);
    margin-bottom: 12px;
}

.empty-title {
    font-size: 1rem;
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin: 0 0 4px;
}

.empty-subtitle {
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.4);
    margin: 0;
}

.lists-list {
    list-style: none;
    margin: 0;
    padding: 0 12px;
    flex: 1;
    overflow-y: auto;
}

.list-item {
    margin-bottom: 8px;
}

.list-item__link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    background: rgba(var(--v-border-color), 0.06);
    min-height: 62px;
    transition: background 0.1s;
}

.list-item__link:hover {
    background: rgba(var(--v-border-color), 0.1);
}

.list-item__icon {
    font-size: 18px;
    flex-shrink: 0;
    opacity: 0.7;
}

.list-item__name {
    flex: 1;
    font-weight: 700;
    text-transform: capitalize;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.list-item__append {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.list-item__count {
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
