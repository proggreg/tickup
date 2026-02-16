<script setup lang="ts">
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
    for (const list of listsStore.lists) {
        if (list.id) {
            await listsStore.getListTodos(list.id);
        }
    }
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
    <v-container
        class="py-4"
        style="max-width: 900px;"
    >
        <div class="d-flex align-center justify-space-between mb-4">
            <h1 class="text-h5">
                Select items
            </h1>
            <v-btn
                variant="text"
                :disabled="selectedIds.size === 0"
                @click="clearSelection"
            >
                Clear
            </v-btn>
        </div>

        <!-- Search + filter row -->
        <v-row dense>
            <v-col
                cols="12"
                md="8"
            >
                <v-text-field
                    v-model="q"
                    label="Search"
                    prepend-inner-icon="mdi-magnify"
                    clearable
                    hide-details
                />
            </v-col>

            <v-col
                cols="12"
                md="4"
            >
                <v-select
                    v-model="category"
                    :items="categoryOptions"
                    label="Category"
                    clearable
                    hide-details
                />
            </v-col>
        </v-row>

        <!-- Mode toggle -->
        <div class="d-flex align-center justify-space-between mt-2 mb-2">
            <v-switch
                v-model="multi"
                inset
                color="primary"
                label="Multi-select"
                hide-details
            />

            <div class="text-caption">
                {{ selectedIds.size }} selected
            </div>
        </div>

        <!-- List -->
        <v-card variant="outlined">
            <v-list
                lines="two"
                density="comfortable"
            >
                <template v-if="filteredItems.length">
                    <v-list-item
                        v-for="item in filteredItems"
                        :key="item.id"
                        :title="item.title"
                        :subtitle="item.subtitle"
                        @click="toggle(item.id)"
                    >
                        <template #prepend>
                            <v-avatar size="36">
                                <v-img
                                    v-if="item.avatarUrl"
                                    :src="item.avatarUrl"
                                />
                                <span
                                    v-else
                                    class="text-caption"
                                >{{ initials(item.title) }}</span>
                            </v-avatar>
                        </template>

                        <template #append>
                            <v-checkbox-btn
                                v-if="multi"
                                :model-value="isSelected(item.id)"
                                @update:model-value="toggle(item.id)"
                                @click.stop
                            />
                            <v-icon
                                v-else
                                :icon="isSelected(item.id) ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank'"
                            />
                        </template>
                    </v-list-item>

                    <v-divider />
                </template>

                <v-list-item v-else>
                    <v-list-item-title>No results</v-list-item-title>
                    <v-list-item-subtitle>Try a different search or filter.</v-list-item-subtitle>
                </v-list-item>
            </v-list>
        </v-card>

        <!-- Sticky bottom actions -->
        <div class="sticky-actions">
            <v-card
                variant="elevated"
                class="px-3 py-2"
            >
                <div class="d-flex ga-2 justify-end">
                    <v-btn
                        variant="text"
                        @click="cancel"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        color="primary"
                        :disabled="selectedIds.size === 0"
                        @click="confirm"
                    >
                        Confirm
                    </v-btn>
                </div>
            </v-card>
        </div>
    </v-container>
</template>

<style scoped>
.sticky-actions {
    position: sticky;
    bottom: 12px;
    margin-top: 16px;
}
</style>
