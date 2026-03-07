<script setup lang="ts">
const searchStore = useSearchStore();
const router = useRouter();
const { isMobile } = useDevice();
const open = ref(false);
const loading = ref(false);

function onKeyDown(e: KeyboardEvent) {
    if (!isMobile && e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        open.value = !open.value;
    }
}

if (import.meta.client) {
    document.addEventListener('keydown', onKeyDown);
}

onBeforeUnmount(() => {
    if (import.meta.client) {
        document.removeEventListener('keydown', onKeyDown);
    }
});

router.beforeResolve(() => {
    open.value = false;
});

watch(() => searchStore.searchQuery, () => {
    if (!isMobile && searchStore.searchQuery && searchStore.searchQuery.length) {
        open.value = true;
    }
    searchStore.debouncedSearch();
});

onMounted(() => {
    searchStore.search();
});
</script>

<template>
    <v-text-field
        v-if="isMobile"
        v-model="searchStore.searchQuery"
        data-testid="mobile-search-input"
        placeholder="search"
        append-inner-icon="mdi-magnify"
        clearable
        hide-details
        variant="outlined"
    />

    <v-dialog
        v-else
        class="ma-6"
        width="500"
        min-height="300"
        max-height="100%"
        height="100%"
        :model-value="open"
        @after-leave="open = false"
    >
        <template #activator="{ props }">
            <v-text-field
                placeholder="ctrl + k"
                class="mx-6"
                append-inner-icon="mdi-magnify"
                @click="open = true"
                v-on="props"
            />
        </template>

        <template #default="{ isActive }">
            <v-card
                v-show="isActive"
                min-height="300"
            >
                <v-card-item class="pa-4">
                    <v-text-field
                        v-model="searchStore.searchQuery"
                        placeholder="search"
                        autofocus
                        clearable
                    />
                </v-card-item>

                <v-divider />

                <v-card-item>
                    <v-list v-if="loading">
                        <v-list-item
                            v-for="n in 5"
                            :key="n"
                        >
                            <v-skeleton-loader type="list-item" />
                        </v-list-item>
                    </v-list>
                    <SearchResults v-else />
                </v-card-item>
            </v-card>
        </template>
    </v-dialog>
</template>
