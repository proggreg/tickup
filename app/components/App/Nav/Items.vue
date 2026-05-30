<script setup lang="ts">
import type { ContextMenuItem } from '~/components/App/ContextMenu.vue';

const listsStore = useListsStore();
const dialog = useDialog();

onBeforeMount(() => {
    listsStore.getLists();
});

// ── State ─────────────────────────────────────────────────────────────────────
const editingId = ref<string | null>(null);
const editName = ref('');
const menu = ref<{ listId: string; x: number; y: number } | null>(null);
const confirmId = ref<string | null>(null);

const menuList = computed(() =>
    menu.value ? (listsStore.lists.find(l => l.id === menu.value!.listId) ?? null) : null,
);
const confirmList = computed(() =>
    confirmId.value ? (listsStore.lists.find(l => l.id === confirmId.value) ?? null) : null,
);

// ── Context menu ──────────────────────────────────────────────────────────────
function openMenuAt(listId: string, x: number, y: number) {
    editingId.value = null;
    menu.value = { listId, x, y };
}

function menuItems(list: List): ContextMenuItem[] {
    return [
        {
            icon: 'mdi-pencil-outline',
            label: 'Rename',
            shortcut: 'F2',
            onClick: () => startRename(list),
        },
        {
            icon: 'mdi-cog-outline',
            label: 'List settings',
            onClick: () => navigateTo(`/list/${list.id}/settings`),
        },
        { divider: true },
        {
            icon: 'mdi-trash-can-outline',
            label: 'Delete',
            danger: true,
            onClick: () => {
                confirmId.value = list.id ?? null;
            },
        },
    ];
}

// ── Rename ────────────────────────────────────────────────────────────────────
function startRename(list: List) {
    editingId.value = list.id!;
    editName.value = list.name;
}

async function commitRename(list: List) {
    const trimmed = editName.value.trim();
    if (trimmed && trimmed !== list.name) {
        list.name = trimmed;
        await listsStore.updateList(list);
    }
    editingId.value = null;
}

function cancelRename() {
    editingId.value = null;
}

// ── Delete confirm ────────────────────────────────────────────────────────────
async function confirmDelete() {
    const id = confirmId.value;
    if (!id) return;
    confirmId.value = null;
    await listsStore.deleteList(id);
}

// Esc to close confirm dialog
function handleConfirmEsc(e: KeyboardEvent) {
    if (e.key === 'Escape') confirmId.value = null;
}

watch(confirmId, (val) => {
    if (val) document.addEventListener('keydown', handleConfirmEsc);
    else document.removeEventListener('keydown', handleConfirmEsc);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleConfirmEsc);
});
</script>

<template>
    <!-- "My Lists" section header -->
    <div class="nav-section-header">
        <span class="nav-section-label">My Lists</span>
        <button
            class="nav-add-btn"
            title="New list"
            @click="
                dialog.page = 'list';
                dialog.open = true;
            "
        >
            <i
                class="mdi mdi-plus"
                style="font-size: 16px"
            />
        </button>
    </div>

    <!-- List rows -->
    <div class="nav-list-rows">
        <div
            v-for="list in listsStore.lists"
            :key="list.id"
            class="nav-row"
            :class="{
                'nav-row--active': listsStore.currentList?.id === list.id,
                'nav-row--editing': editingId === list.id,
            }"
            @click="editingId !== list.id && navigateTo(`/list/${list.id}`)"
            @contextmenu.prevent="openMenuAt(list.id!, $event.clientX, $event.clientY)"
        >
            <!-- Icon -->
            <i
                class="mdi nav-row__icon"
                :class="list.icon || 'mdi-format-list-bulleted'"
                :style="{ opacity: listsStore.currentList?.id === list.id ? 1 : 0.55 }"
            />

            <!-- Rename input -->
            <input
                v-if="editingId === list.id"
                :ref="
                    (el: HTMLInputElement | null) => {
                        if (el) {
                            el.focus();
                            el.select();
                        }
                    }
                "
                v-model="editName"
                class="nav-row__rename"
                data-testid="rename-list"
                @click.stop
                @blur="commitRename(list)"
                @keydown.enter.prevent="commitRename(list)"
                @keydown.esc.prevent="cancelRename"
            >
            <!-- Name -->
            <span
                v-else
                class="nav-row__name"
            >{{ list.name }}</span>

            <!-- Count + dots (not during edit) -->
            <template v-if="editingId !== list.id">
                <span class="nav-row__count">{{ list.todos?.length || '' }}</span>
                <button
                    class="nav-row__dots"
                    :data-testid="`setting-button-${list.id}`"
                    title="List options"
                    @click.stop="
                        (e: MouseEvent) => {
                            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            openMenuAt(list.id!, r.right, r.bottom + 4);
                        }
                    "
                >
                    <i
                        class="mdi mdi-dots-horizontal"
                        style="font-size: 16px"
                    />
                </button>
            </template>
        </div>
    </div>

    <!-- Context menu -->
    <AppContextMenu
        v-if="menu && menuList"
        :x="menu.x"
        :y="menu.y"
        :items="menuItems(menuList)"
        @close="menu = null"
    />

    <!-- Delete confirmation -->
    <Teleport to="body">
        <div
            v-if="confirmId && confirmList"
            class="nav-confirm-backdrop"
            @click="confirmId = null"
        >
            <div
                class="nav-confirm-dialog"
                @click.stop
            >
                <div class="nav-confirm-icon">
                    <i
                        class="mdi mdi-trash-can-outline"
                        style="font-size: 22px; color: #ba1b24"
                    />
                </div>
                <div class="nav-confirm-title">
                    Delete list
                </div>
                <div class="nav-confirm-body">
                    Are you sure you want to delete
                    <strong>{{ confirmList.name }}</strong>? All tasks in this list will be permanently removed.
                </div>
                <div class="nav-confirm-actions">
                    <button
                        class="nav-confirm-cancel"
                        @click="confirmId = null"
                    >
                        Cancel
                    </button>
                    <button
                        class="nav-confirm-delete"
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
/* ── Section header ───────────────────────────────────────────────────────── */
.nav-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 14px 6px;
}

.nav-section-label {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(42, 52, 57, 0.38);
}

.nav-add-btn {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(42, 52, 57, 0.55);
    transition: background 0.08s;
}
.nav-add-btn:hover {
    background: #e1e9ee;
}

/* ── List rows container ──────────────────────────────────────────────────── */
.nav-list-rows {
    padding: 0 8px 12px;
}

/* ── Row ──────────────────────────────────────────────────────────────────── */
.nav-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 8px 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 2px;
    min-height: 38px;
    background: transparent;
    color: #2a3439;
    position: relative;
    transition: background 0.1s;
}
.nav-row:hover {
    background: rgba(113, 124, 130, 0.1);
}
.nav-row--active {
    background: #dce8ff;
    color: #004eaa;
}
.nav-row--active:hover {
    background: #dce8ff;
}
.nav-row--editing {
    cursor: default;
}

.nav-row__icon {
    font-size: 17px;
    flex-shrink: 0;
}

.nav-row__name {
    flex: 1;
    min-width: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.nav-row__rename {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: #ffffff;
    border-radius: 5px;
    padding: 3px 7px;
    font-family: Inter, sans-serif;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #2a3439;
    box-shadow: 0 0 0 2px #005ac2;
}

/* Count badge — hidden on row hover to reveal dots */
.nav-row__count {
    font-size: 0.6875rem;
    font-weight: 600;
    color: rgba(42, 52, 57, 0.38);
    opacity: 0.85;
    transition: opacity 0.1s;
    position: absolute;
    right: 10px;
    pointer-events: none;
}
.nav-row:hover .nav-row__count {
    opacity: 0;
}
.nav-row--active .nav-row__count {
    color: #004eaa;
}

/* Dots button — hidden by default, shown on row hover */
.nav-row__dots {
    width: 24px;
    height: 24px;
    border-radius: 5px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: rgba(42, 52, 57, 0.55);
    transition: background 0.08s;
}
.nav-row:hover .nav-row__dots {
    display: flex;
}
.nav-row--active .nav-row__dots {
    color: #004eaa;
}
.nav-row__dots:hover {
    background: #e1e9ee;
}

/* ── Delete confirmation ───────────────────────────────────────────────────── */
.nav-confirm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 30, 53, 0.32);
    backdrop-filter: blur(2px);
}

.nav-confirm-dialog {
    width: 320px;
    max-width: 90vw;
    background: #ffffff;
    border-radius: 14px;
    padding: 24px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
}

.nav-confirm-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: rgba(186, 27, 36, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
}

.nav-confirm-title {
    font-family: Manrope, sans-serif;
    font-size: 1.0625rem;
    font-weight: 700;
    color: #2a3439;
    margin-bottom: 6px;
}

.nav-confirm-body {
    font-size: 0.875rem;
    color: rgba(42, 52, 57, 0.55);
    line-height: 1.5;
    margin-bottom: 20px;
}

.nav-confirm-body strong {
    color: #2a3439;
    font-weight: 600;
}

.nav-confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.nav-confirm-cancel {
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
.nav-confirm-cancel:hover {
    background: rgba(113, 124, 130, 0.1);
}

.nav-confirm-delete {
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
.nav-confirm-delete:hover {
    opacity: 0.9;
}
</style>
