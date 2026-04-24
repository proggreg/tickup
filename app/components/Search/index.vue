<script setup lang="ts">
import { Dialog, Input } from '@vuetify/v0';

const searchStore = useSearchStore();
const router = useRouter();
const { isMobile } = useDevice();
const open = ref(false);

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
    <!-- Mobile: inline search field -->
    <div
        v-if="isMobile"
        class="search-field-wrapper"
    >
        <Input.Root v-model="searchStore.searchQuery">
            <Input.Control
                class="search-input"
                placeholder="search"
                data-testid="mobile-search-input"
            />
        </Input.Root>
        <i class="mdi mdi-magnify search-icon" />
    </div>

    <!-- Desktop: click-to-open dialog -->
    <template v-else>
        <button
            class="search-trigger"
            @click="open = true"
        >
            <i class="mdi mdi-magnify" />
            <span>ctrl + k</span>
        </button>

        <Dialog.Root v-model="open">
            <Dialog.Content class="search-dialog">
                <div class="search-dialog__inner">
                    <div class="search-dialog__header">
                        <Input.Root v-model="searchStore.searchQuery">
                            <Input.Control
                                class="search-input search-input--dialog"
                                placeholder="search"
                                autofocus
                            />
                        </Input.Root>
                    </div>
                    <div class="search-dialog__results">
                        <SearchResults />
                    </div>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    </template>
</template>

<style scoped>
.search-field-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-input {
    width: 100%;
    padding: 8px 36px 8px 12px;
    border: none;
    border-radius: 8px;
    background: rgb(var(--v-theme-surface-container-low));
    color: inherit;
    font-size: 0.875rem;
    outline: none;
    font-family: inherit;
    box-sizing: border-box;
}

.search-input:focus {
    background: rgb(var(--v-theme-surface-container));
}

.search-icon {
    position: absolute;
    right: 10px;
    font-size: 18px;
    color: rgba(var(--v-theme-on-surface), 0.5);
    pointer-events: none;
}

.search-trigger {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: 1px solid rgb(var(--v-theme-outline));
    border-radius: 8px;
    background: rgb(var(--v-theme-surface-container-low));
    color: rgb(var(--v-theme-on-surface));
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
    width: 100%;
    max-width: 480px;
}

.search-trigger:hover {
    background: rgb(var(--v-theme-surface-container));
}

.search-trigger .mdi {
    font-size: 18px;
}

/* Do NOT set display here — overrides dialog's native display:none when closed */
.search-dialog {
    border: none;
    padding: 0;
    width: 640px;
    max-width: calc(100vw - 48px);
    max-height: 80vh;
    background: transparent;
    overflow: visible;
    margin: auto;
}

/* Background on inner div, not on the <dialog> element */
.search-dialog__inner {
    display: flex;
    flex-direction: column;
    background: rgb(var(--v-theme-surface));
    border-radius: 12px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.32);
    overflow: hidden;
    min-height: 300px;
    max-height: 80vh;
}

.search-dialog__header {
    padding: 20px 24px 16px;
}

.search-input--dialog {
    font-size: 1.4rem;
    font-weight: 500;
    padding: 4px 0 8px;
    background: transparent;
    border-radius: 0;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.24);
    color: rgb(var(--v-theme-on-surface));
    width: 100%;
    outline: none;
    font-family: inherit;
    box-sizing: border-box;
}

.search-input--dialog::placeholder {
    color: rgb(var(--v-theme-outline));
    opacity: 1;
}

.search-input--dialog:focus {
    border-bottom-color: rgb(var(--v-theme-primary));
}

.search-dialog__results {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}
</style>

<style>
/* ::backdrop can't be scoped */
.search-dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
}
</style>
