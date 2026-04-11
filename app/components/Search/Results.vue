<script setup lang="ts">
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
    <v-list
        v-if="store.loading"
        class="px-3 bg-transparent"
    >
        <v-list-item
            v-for="n in 5"
            :key="n"
            rounded="xl"
            class="mb-2"
            base-color="surface-variant"
            variant="tonal"
            min-height="62"
        >
            <template #prepend>
                <div class="skeleton-circle mr-3" />
            </template>
            <div
                class="skeleton-line mb-2"
                style="width: 60%;"
            />
            <div
                class="skeleton-line"
                style="width: 35%;"
            />
        </v-list-item>
    </v-list>

    <div
        v-else-if="store.results.length === 0 && store.searchQuery"
        class="d-flex flex-column align-center justify-center flex-grow-1 pa-8 text-center"
    >
        <v-icon
            icon="mdi-magnify-remove-outline"
            size="56"
            class="text-disabled mb-3"
        />
        <p class="text-body-1 font-weight-medium text-medium-emphasis mb-1">
            No results found
        </p>
        <p class="text-body-2 text-disabled">
            Try searching with different keywords
        </p>
    </div>

    <div
        v-else-if="store.results.length === 0"
        class="d-flex flex-column align-center justify-center flex-grow-1 pa-8 text-center"
    >
        <v-icon
            icon="mdi-magnify"
            size="56"
            class="text-disabled mb-3"
        />
        <p class="text-body-1 font-weight-medium text-medium-emphasis mb-1">
            Search your todos
        </p>
        <p class="text-body-2 text-disabled">
            Type above to find anything
        </p>
    </div>

    <v-list
        v-else
        class="px-3 flex-grow-1 bg-transparent"
        style="overflow-y: auto;"
    >
        <v-list-item
            v-for="item in store.results"
            :key="item.id"
            :to="`/todo/${item.id}`"
            rounded="xl"
            class="mb-2"
            base-color="surface-variant"
            variant="tonal"
            min-height="62"
        >
            <template #prepend>
                <div class="mr-3">
                    <ListStatus
                        :todo="item"
                        :disabled="props.disableStatusButton"
                    />
                </div>
            </template>

            <v-list-item-title class="font-weight-bold">
                {{ item.name }}
            </v-list-item-title>

            <v-list-item-subtitle class="d-flex align-center ga-2 mt-1">
                <v-chip
                    v-if="item.list"
                    size="x-small"
                    variant="tonal"
                    label
                >
                    {{ item.list.name }}
                </v-chip>
                <span class="text-caption text-disabled">{{ formatDate(item.updatedAt) }}</span>
            </v-list-item-subtitle>

            <template
                v-if="!isMobile"
                #append
            >
                <v-btn
                    :to="`/todo/${item.id}`"
                    icon="mdi-open-in-new"
                    variant="text"
                    size="small"
                />
            </template>
        </v-list-item>
    </v-list>
</template>

<style scoped>
@keyframes shimmer {
    0% { opacity: 0.4; }
    50% { opacity: 0.8; }
    100% { opacity: 0.4; }
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
</style>
