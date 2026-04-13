<script setup lang="ts">
import { Button, Checkbox, Input, Select, Switch } from '@vuetify/v0';

definePageMeta({
    auth: {
        unauthenticatedOnly: false,
        navigateUnauthenticatedTo: '/login',
    },
});

useHead({ title: 'TickUp: Select Items' });

const listsStore = useListsStore();

type SelectableItem = {
    id: string;
    title: string;
    subtitle?: string;
    category?: string;
    avatarUrl?: string;
};

const q = ref('');
const category = ref<string | null>(null);
const multi = ref(true);
const selectedIds = ref<Set<string>>(new Set());

onMounted(async () => {
    await listsStore.getLists();
    await Promise.all(listsStore.lists.filter(l => l.id).map(l => listsStore.getListTodos(l.id)));
});

const selectableItems = computed<SelectableItem[]>(() => {
    const items: SelectableItem[] = [];
    for (const list of listsStore.lists) {
        for (const todo of (list.todos || [])) {
            if (todo.id) {
                items.push({
                    id: todo.id,
                    title: todo.name,
                    subtitle: todo.status,
                    category: list.name,
                });
            }
        }
    }
    return items;
});

const categoryOptions = computed(() => {
    const set = new Set(selectableItems.value.map(i => i.category).filter(Boolean) as string[]);
    return Array.from(set).sort();
});

const filteredItems = computed(() => {
    const query = q.value?.trim().toLowerCase() ?? '';
    return selectableItems.value.filter((i) => {
        const matchesQuery
            = !query
                || i.title.toLowerCase().includes(query)
                || (i.subtitle?.toLowerCase().includes(query) ?? false);

        const matchesCategory = !category.value || i.category === category.value;
        return matchesQuery && matchesCategory;
    });
});

function isSelected(id: string) {
    return selectedIds.value.has(id);
}

function toggle(id: string) {
    const next = new Set(selectedIds.value);

    if (multi.value) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
    }
    else {
        if (next.has(id)) next.clear();
        else {
            next.clear();
            next.add(id);
        }
    }

    selectedIds.value = next;
}

function clearSelection() {
    selectedIds.value = new Set();
}

function confirm() {
    const ids = Array.from(selectedIds.value);
    console.log('Confirmed:', ids);
    navigateTo('/');
}

function cancel() {
    navigateTo('/');
}

function initials(name: string) {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map(p => p[0]?.toUpperCase() ?? '')
        .join('');
}
</script>

<template>
    <div class="select-page">
        <div class="select-page__header">
            <h1 class="select-page__title">Select items</h1>
            <Button.Root
                class="btn"
                :disabled="selectedIds.size === 0"
                @click="clearSelection"
            >
                Clear
            </Button.Root>
        </div>

        <!-- Search + filter row -->
        <div class="filter-row">
            <div class="filter-row__search">
                <div class="search-field-wrapper">
                    <i class="mdi mdi-magnify search-icon" />
                    <Input.Root v-model="q">
                        <Input.Control
                            class="search-input"
                            placeholder="Search"
                        />
                    </Input.Root>
                </div>
            </div>

            <div class="filter-row__category">
                <Select.Root v-model="category">
                    <Select.Activator>
                        <button class="category-trigger">
                            <Select.Value placeholder="Category" />
                            <i class="mdi mdi-chevron-down" />
                        </button>
                    </Select.Activator>
                    <Select.Content>
                        <Select.Item
                            value=""
                            class="select-item"
                        >
                            <span>All</span>
                        </Select.Item>
                        <Select.Item
                            v-for="cat in categoryOptions"
                            :key="cat"
                            :value="cat"
                            class="select-item"
                        >
                            <span>{{ cat }}</span>
                            <Select.ItemIndicator>
                                <i class="mdi mdi-check" />
                            </Select.ItemIndicator>
                        </Select.Item>
                    </Select.Content>
                </Select.Root>
            </div>
        </div>

        <!-- Mode toggle -->
        <div class="mode-row">
            <div class="switch-row">
                <Switch.Root
                    v-model="multi"
                    class="switch-root"
                    :class="{ 'switch-root--on': multi }"
                >
                    <Switch.Thumb class="switch-thumb" />
                </Switch.Root>
                <span class="switch-label">Multi-select</span>
            </div>
            <div class="selected-count">{{ selectedIds.size }} selected</div>
        </div>

        <!-- List -->
        <div class="items-card">
            <template v-if="filteredItems.length">
                <div
                    v-for="item in filteredItems"
                    :key="item.id"
                    class="item-row"
                    @click="toggle(item.id)"
                >
                    <div class="item-avatar">
                        <img
                            v-if="item.avatarUrl"
                            :src="item.avatarUrl"
                            class="item-avatar__img"
                            alt=""
                        >
                        <span
                            v-else
                            class="item-avatar__initials"
                        >{{ initials(item.title) }}</span>
                    </div>
                    <div class="item-body">
                        <span class="item-title">{{ item.title }}</span>
                        <span
                            v-if="item.subtitle"
                            class="item-subtitle"
                        >{{ item.subtitle }}</span>
                    </div>
                    <div class="item-append">
                        <Checkbox.Root
                            v-if="multi"
                            class="item-checkbox"
                            :class="{ 'item-checkbox--checked': isSelected(item.id) }"
                            :checked="isSelected(item.id)"
                            @click.stop="toggle(item.id)"
                        >
                            <Checkbox.Indicator class="item-checkbox__indicator">
                                <i class="mdi mdi-check" />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <i
                            v-else
                            :class="`mdi ${isSelected(item.id) ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'} radio-icon`"
                        />
                    </div>
                </div>
                <hr class="item-divider">
            </template>

            <div
                v-else
                class="items-empty"
            >
                <span class="items-empty__title">No results</span>
                <span class="items-empty__sub">Try a different search or filter.</span>
            </div>
        </div>

        <!-- Sticky bottom actions -->
        <div class="sticky-actions">
            <div class="sticky-actions__card">
                <div class="sticky-actions__inner">
                    <Button.Root
                        class="btn"
                        @click="cancel"
                    >
                        Cancel
                    </Button.Root>
                    <Button.Root
                        class="btn btn--primary"
                        :disabled="selectedIds.size === 0"
                        @click="confirm"
                    >
                        Confirm
                    </Button.Root>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.select-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 16px;
}

.select-page__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.select-page__title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
}

.btn {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    background: rgba(var(--v-border-color), 0.1);
    color: inherit;
    transition: background 0.15s;
}

.btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.btn:hover:not(:disabled) {
    background: rgba(var(--v-border-color), 0.18);
}

.btn--primary {
    background: rgb(var(--v-theme-primary));
    color: #fff;
}

.btn--primary:hover:not(:disabled) {
    background: rgba(var(--v-theme-primary), 0.85);
}

.filter-row {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
}

.filter-row__search {
    flex: 2;
}

.filter-row__category {
    flex: 1;
}

.search-field-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 10px;
    font-size: 18px;
    color: rgba(var(--v-theme-on-surface), 0.5);
    pointer-events: none;
    z-index: 1;
}

.search-input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font-size: 0.9375rem;
    outline: none;
    font-family: inherit;
    box-sizing: border-box;
}

.search-input:focus {
    border-color: rgb(var(--v-theme-primary));
}

.category-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font-size: 0.9375rem;
    font-family: inherit;
    cursor: pointer;
    width: 100%;
}

.category-trigger .mdi {
    font-size: 16px;
    opacity: 0.6;
    margin-left: auto;
}

.select-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 0.875rem;
    border-radius: 4px;
    transition: background 0.1s;
}

.select-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.mode-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 8px 0;
}

.switch-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.switch-root {
    display: inline-flex;
    align-items: center;
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background: rgba(var(--v-border-color), 0.3);
    cursor: pointer;
    border: none;
    padding: 2px;
    transition: background 0.2s;
    position: relative;
}

.switch-root--on {
    background: rgb(var(--v-theme-primary));
}

.switch-thumb {
    display: block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
}

.switch-root--on .switch-thumb {
    transform: translateX(20px);
}

.switch-label {
    font-size: 0.9375rem;
}

.selected-count {
    font-size: 0.8125rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
}

.items-card {
    border: 1px solid rgba(var(--v-border-color), 0.15);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
}

.item-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.1s;
    min-height: 62px;
}

.item-row:hover {
    background: rgba(var(--v-border-color), 0.06);
}

.item-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(var(--v-border-color), 0.1);
    flex-shrink: 0;
    overflow: hidden;
}

.item-avatar__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-avatar__initials {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.item-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.item-title {
    font-size: 0.9375rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.item-subtitle {
    font-size: 0.8125rem;
    color: rgba(var(--v-theme-on-surface), 0.5);
}

.item-append {
    flex-shrink: 0;
}

.item-checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(var(--v-border-color), 0.4);
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
    transition: border-color 0.15s, background 0.15s;
}

.item-checkbox--checked {
    background: rgb(var(--v-theme-primary));
    border-color: rgb(var(--v-theme-primary));
}

.item-checkbox__indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 12px;
}

.item-checkbox:not(.item-checkbox--checked) .item-checkbox__indicator {
    display: none;
}

.radio-icon {
    font-size: 20px;
    color: rgba(var(--v-theme-on-surface), 0.5);
}

.item-divider {
    border: none;
    border-top: 1px solid rgba(var(--v-border-color), 0.1);
    margin: 0;
}

.items-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 24px;
    text-align: center;
}

.items-empty__title {
    font-size: 0.9375rem;
    font-weight: 500;
}

.items-empty__sub {
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.5);
}

.sticky-actions {
    position: sticky;
    bottom: 12px;
    margin-top: 16px;
}

.sticky-actions__card {
    border-radius: 8px;
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 8px 12px;
}

.sticky-actions__inner {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
}
</style>
