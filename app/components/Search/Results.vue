<script setup lang="ts">
import { Button } from '@vuetify/v0';

const store = useSearchStore();
const props = withDefaults(defineProps<{ disableStatusButton?: boolean }>(), {
    disableStatusButton: false,
});
const _emit = defineEmits<{
    'item-click': [item: Todo];
}>();
const { isMobile } = useDevice();

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
</script>

<template>
    <ul
        v-if="store.loading"
        class="results-list"
    >
        <li
            v-for="n in 5"
            :key="n"
            class="skeleton-item"
        >
            <div class="skeleton-circle" />
            <div class="skeleton-body">
                <div
                    class="skeleton-line"
                    style="width: 60%;"
                />
                <div
                    class="skeleton-line"
                    style="width: 35%;"
                />
            </div>
        </li>
    </ul>

    <div
        v-else-if="store.results.length === 0 && store.searchQuery"
        class="empty-state"
    >
        <i class="mdi mdi-magnify-remove-outline empty-state__icon" />
        <p class="empty-state__title">No results found</p>
        <p class="empty-state__subtitle">Try searching with different keywords</p>
    </div>

    <div
        v-else-if="store.results.length === 0"
        class="empty-state"
    >
        <i class="mdi mdi-magnify empty-state__icon" />
        <p class="empty-state__title">Search your todos</p>
        <p class="empty-state__subtitle">Type above to find anything</p>
    </div>

    <ul
        v-else
        class="results-list"
    >
        <li
            v-for="item in store.results"
            :key="item.id"
            class="result-item"
        >
            <NuxtLink
                :to="`/todo/${item.id}`"
                class="result-item__link"
            >
                <div class="result-item__status">
                    <ListStatus
                        :todo="item"
                        :disabled="props.disableStatusButton"
                    />
                </div>
                <div class="result-item__body">
                    <span class="result-item__name">{{ item.name }}</span>
                    <div class="result-item__meta">
                        <span
                            v-if="item.list"
                            class="result-item__badge"
                        >{{ item.list.name }}</span>
                        <span class="result-item__date">{{ formatDate(item.updatedAt) }}</span>
                    </div>
                </div>
                <div
                    v-if="!isMobile"
                    class="result-item__action"
                >
                    <Button.Root
                        :to="`/todo/${item.id}`"
                        class="icon-btn"
                        aria-label="Open todo"
                    >
                        <Button.Icon>
                            <i class="mdi mdi-open-in-new" />
                        </Button.Icon>
                    </Button.Root>
                </div>
            </NuxtLink>
        </li>
    </ul>
</template>

<style scoped>
@keyframes shimmer {
    0% { opacity: 0.4; }
    50% { opacity: 0.8; }
    100% { opacity: 0.4; }
}

.results-list {
    list-style: none;
    margin: 0;
    padding: 12px;
    overflow-y: auto;
    flex: 1;
}

.skeleton-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 12px;
    background: rgba(var(--v-border-color), 0.06);
    min-height: 62px;
}

.skeleton-circle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.2;
    animation: shimmer 1.4s ease-in-out infinite;
    flex-shrink: 0;
}

.skeleton-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.skeleton-line {
    height: 12px;
    border-radius: 6px;
    background: currentColor;
    opacity: 0.2;
    animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-line:nth-child(2) {
    animation-delay: 0.1s;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 32px;
    text-align: center;
}

.empty-state__icon {
    font-size: 56px;
    color: rgba(var(--v-theme-on-surface), 0.3);
    margin-bottom: 12px;
}

.empty-state__title {
    font-size: 1rem;
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin: 0 0 4px;
}

.empty-state__subtitle {
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.4);
    margin: 0;
}

.result-item {
    margin-bottom: 8px;
    border-radius: 12px;
    overflow: hidden;
    transition: background 0.1s;
}

.result-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.result-item__link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    text-decoration: none;
    color: inherit;
    min-height: 62px;
}

.result-item__status {
    flex-shrink: 0;
}

.result-item__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.result-item__name {
    font-size: 0.9375rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.result-item__meta {
    display: flex;
    align-items: center;
    gap: 8px;
}

.result-item__badge {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    background: rgba(var(--v-border-color), 0.1);
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.result-item__date {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.4);
}

.result-item__action {
    flex-shrink: 0;
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn .mdi {
    font-size: 18px;
}
</style>
