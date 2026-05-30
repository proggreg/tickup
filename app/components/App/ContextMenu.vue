<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

export interface ContextMenuItem {
    icon?: string;
    label?: string;
    shortcut?: string;
    danger?: boolean;
    divider?: boolean;
    onClick?: () => void;
}

const props = defineProps<{
    x: number;
    y: number;
    items: ContextMenuItem[];
}>();

const emit = defineEmits<{ close: [] }>();

const menuEl = ref<HTMLElement | null>(null);
const pos = ref({ left: props.x, top: props.y, ready: false });

async function reposition() {
    await nextTick();
    const el = menuEl.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let left = props.x;
    let top = props.y;
    if (left + rect.width > window.innerWidth - 8) left = window.innerWidth - rect.width - 8;
    if (top + rect.height > window.innerHeight - 8) top = props.y - rect.height;
    if (top < 8) top = 8;
    if (left < 8) left = 8;
    pos.value = { left, top, ready: true };
}

function handleOutside(e: MouseEvent) {
    if (menuEl.value && !menuEl.value.contains(e.target as Node)) emit('close');
}

function handleEsc(e: KeyboardEvent) {
    if (e.key === 'Escape') emit('close');
}

onMounted(() => {
    reposition();
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
});

onUnmounted(() => {
    document.removeEventListener('mousedown', handleOutside);
    document.removeEventListener('keydown', handleEsc);
});
</script>

<template>
    <Teleport to="body">
        <div
            ref="menuEl"
            class="ctx-menu"
            :style="{
                left: pos.left + 'px',
                top: pos.top + 'px',
                opacity: pos.ready ? 1 : 0,
                transform: pos.ready ? 'scale(1)' : 'scale(0.96)',
            }"
            @contextmenu.prevent
        >
            <template
                v-for="(item, i) in items"
                :key="i"
            >
                <div
                    v-if="item.divider"
                    class="ctx-divider"
                />
                <button
                    v-else
                    class="ctx-item"
                    :class="{ 'ctx-item--danger': item.danger }"
                    @click="
                        item.onClick?.();
                        emit('close');
                    "
                >
                    <i
                        v-if="item.icon"
                        class="mdi"
                        :class="item.icon"
                        :style="{
                            fontSize: '16px',
                            width: '18px',
                            textAlign: 'center',
                            opacity: item.danger ? 1 : 0.7,
                        }"
                    />
                    <span class="ctx-item__label">{{ item.label }}</span>
                    <span
                        v-if="item.shortcut"
                        class="ctx-item__shortcut"
                    >{{ item.shortcut }}</span>
                </button>
            </template>
        </div>
    </Teleport>
</template>

<style scoped>
.ctx-menu {
    position: fixed;
    z-index: 2000;
    min-width: 180px;
    background: #ffffff;
    border: 1px solid rgba(113, 124, 130, 0.16);
    border-radius: 10px;
    box-shadow:
        0 8px 28px rgba(42, 52, 57, 0.16),
        0 2px 6px rgba(42, 52, 57, 0.06);
    padding: 5px;
    transform-origin: top left;
    transition:
        opacity 0.1s,
        transform 0.1s;
}

.ctx-divider {
    height: 1px;
    background: rgba(113, 124, 130, 0.16);
    margin: 5px 6px;
}

.ctx-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background: transparent;
    color: #2a3439;
    font-family: Inter, sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: left;
    transition: background 0.08s;
}
.ctx-item:hover {
    background: rgba(113, 124, 130, 0.1);
}
.ctx-item--danger {
    color: #ba1b24;
}
.ctx-item--danger:hover {
    background: rgba(186, 27, 36, 0.08);
}
.ctx-item__label {
    flex: 1;
}
.ctx-item__shortcut {
    font-size: 0.6875rem;
    color: rgba(42, 52, 57, 0.38);
    letter-spacing: 0.02em;
}
</style>
