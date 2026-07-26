<script setup lang="ts">
import type { ContextMenuItem } from '~/components/App/ContextMenu.vue';

const props = defineProps<{ listId: string }>();
const emit = defineEmits<{ rename: [] }>();

const listsStore = useListsStore();

const menu = ref<{ x: number; y: number } | null>(null);
const confirmOpen = ref(false);

const listName = computed(() => listsStore.lists.find((l) => l.id === props.listId)?.name ?? '');

function openMenu(e: MouseEvent) {
    e.stopPropagation();
    const btn = e.currentTarget as HTMLElement;
    const r = btn.getBoundingClientRect();
    menu.value = { x: r.right, y: r.bottom + 4 };
}

const menuItems = computed<ContextMenuItem[]>(() => [
    { icon: 'mdi-pencil-outline', label: 'Rename', onClick: () => emit('rename') },
    {
        icon: 'mdi-cog-outline',
        label: 'List settings',
        onClick: () => navigateTo(`/list/${props.listId}/settings`),
    },
    { divider: true },
    {
        icon: 'mdi-trash-can-outline',
        label: 'Delete',
        danger: true,
        onClick: () => {
            confirmOpen.value = true;
        },
    },
]);

async function confirmDelete() {
    confirmOpen.value = false;
    await listsStore.deleteList(props.listId);
}

function handleEsc(e: KeyboardEvent) {
    if (e.key === 'Escape') confirmOpen.value = false;
}

watch(confirmOpen, (val) => {
    if (val) document.addEventListener('keydown', handleEsc);
    else document.removeEventListener('keydown', handleEsc);
});

onUnmounted(() => document.removeEventListener('keydown', handleEsc));
</script>

<template>
    <button
        class="lm-btn"
        :data-testid="`setting-button-${listId}`"
        title="List options"
        @click="openMenu"
    >
        <i class="mdi mdi-dots-horizontal" style="font-size: 16px" />
    </button>

    <AppContextMenu v-if="menu" :x="menu.x" :y="menu.y" :items="menuItems" @close="menu = null" />

    <Teleport to="body">
        <div v-if="confirmOpen" class="lm-backdrop" @click="confirmOpen = false">
            <div class="lm-dialog" @click.stop>
                <div class="lm-dialog__icon">
                    <i class="mdi mdi-trash-can-outline" style="font-size: 22px; color: #ba1b24" />
                </div>
                <div class="lm-dialog__title">Delete list</div>
                <div class="lm-dialog__body">
                    Are you sure you want to delete <strong>{{ listName }}</strong
                    >? All tasks in this list will be permanently removed.
                </div>
                <div class="lm-dialog__actions">
                    <button class="lm-dialog__cancel" @click="confirmOpen = false">Cancel</button>
                    <button
                        class="lm-dialog__delete"
                        data-testid="delete-list"
                        @click="confirmDelete"
                    >
                        Delete list
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.lm-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(42, 52, 57, 0.55);
    transition: background 0.08s;
}
.lm-btn:hover {
    background: rgba(113, 124, 130, 0.1);
}

.lm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 30, 53, 0.32);
    backdrop-filter: blur(2px);
}

.lm-dialog {
    width: 320px;
    max-width: 90vw;
    background: #ffffff;
    border-radius: 14px;
    padding: 24px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
}

.lm-dialog__icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: rgba(186, 27, 36, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
}

.lm-dialog__title {
    font-family: Manrope, sans-serif;
    font-size: 1.0625rem;
    font-weight: 700;
    color: #2a3439;
    margin-bottom: 6px;
}

.lm-dialog__body {
    font-size: 0.875rem;
    color: rgba(42, 52, 57, 0.55);
    line-height: 1.5;
    margin-bottom: 20px;
}

.lm-dialog__body strong {
    color: #2a3439;
    font-weight: 600;
}

.lm-dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.lm-dialog__cancel {
    padding: 8px 16px;
    border: 1px solid rgba(113, 124, 130, 0.24);
    background: transparent;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #2a3439;
    cursor: pointer;
    font-family: Inter, sans-serif;
    transition: background 0.08s;
}
.lm-dialog__cancel:hover {
    background: rgba(113, 124, 130, 0.1);
}

.lm-dialog__delete {
    padding: 8px 16px;
    border: none;
    background: #ba1b24;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
    font-family: Inter, sans-serif;
    transition: opacity 0.08s;
}
.lm-dialog__delete:hover {
    opacity: 0.9;
}
</style>
