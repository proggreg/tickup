<script setup lang="ts">
import { Input } from '@vuetify/v0';

const searchStore = useSearchStore();
const router = useRouter();
const { isMobile } = useDevice();
const open = ref(false);
const dialogEl = ref<HTMLDialogElement | null>(null);

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

watch(open, (val) => {
    if (!dialogEl.value) return;
    if (val) { dialogEl.value.showModal(); }
    else { dialogEl.value.close(); }
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

        <Teleport to="body">
            <dialog
                ref="dialogEl"
                class="search-dialog"
                @close="open = false"
                @click.self="open = false"
            >
                <div class="search-dialog__content">
                    <div class="search-dialog__header">
                        <Input.Root v-model="searchStore.searchQuery">
                            <Input.Control
                                class="search-input search-input--dialog"
                                placeholder="search"
                                autofocus
                            />
                        </Input.Root>
                    </div>
                    <hr class="search-dialog__divider">
                    <div class="search-dialog__results">
                        <SearchResults />
                    </div>
                </div>
            </dialog>
        </Teleport>
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
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font-size: 0.875rem;
    outline: none;
    font-family: inherit;
    box-sizing: border-box;
}

.search-input:focus {
    border-color: rgb(var(--v-theme-primary));
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
    margin: 0 24px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 8px;
    background: transparent;
    color: rgba(var(--v-theme-on-surface), 0.5);
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.15s;
}

.search-trigger:hover {
    border-color: rgba(var(--v-border-color), 0.6);
    color: rgba(var(--v-theme-on-surface), 0.8);
}

.search-trigger .mdi {
    font-size: 18px;
}

.search-dialog {
    border: none;
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    padding: 0;
    width: 500px;
    max-width: calc(100vw - 48px);
    min-height: 300px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.search-dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
}

.search-dialog__content {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 300px;
    max-height: 80vh;
}

.search-dialog__header {
    padding: 16px;
}

.search-input--dialog {
    font-size: 1rem;
}

.search-dialog__divider {
    border: none;
    border-top: 1px solid rgba(var(--v-border-color), 0.12);
    margin: 0;
}

.search-dialog__results {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}
</style>
