<script setup lang="ts">
const palette = usePalette();
interface Props {
    status: { name: string; color: string };
    index: number;
    total: number;
    locked: 'start' | 'end' | false;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    'update:name': [name: string];
    'update:color': [color: string];
    'delete': [];
}>();

const isEditingStatus = ref(false);
const editName = ref('');
const showColorPicker = ref(false);
const swatchWrapRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

function startEdit() {
    if (props.locked) return;
    editName.value = props.status.name;
    isEditingStatus.value = true;
    nextTick(() => inputRef.value?.focus());
}

function commitEdit() {
    isEditingStatus.value = false;
    emit('update:name', editName.value);
}

function cancelEdit() {
    isEditingStatus.value = false;
    editName.value = props.status.name;
}

function onNameKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') cancelEdit();
}

function selectColor(c: string) {
    emit('update:color', c);
    showColorPicker.value = false;
}

function onDocPointerdown(e: PointerEvent) {
    if (
        showColorPicker.value
        && swatchWrapRef.value
        && !swatchWrapRef.value.contains(e.target as Node)
    ) {
        showColorPicker.value = false;
    }
}

onMounted(() => document.addEventListener('pointerdown', onDocPointerdown));
onUnmounted(() => document.removeEventListener('pointerdown', onDocPointerdown));

defineExpose({ startEdit });
</script>

<template>
    <div class="status-row">
        <div class="status-row__handle">
            <v-icon
                v-if="locked"
                icon="mdi-lock-outline"
                :size="13"
                style="color: rgba(42, 52, 57, 0.22)"
            />
            <v-icon
                v-else
                icon="mdi-drag-vertical"
                :size="16"
                class="drag-handle"
                style="color: rgba(42, 52, 57, 0.22); cursor: grab"
            />
        </div>

        <div
            ref="swatchWrapRef"
            class="status-row__swatch-wrap"
        >
            <div
                class="status-row__swatch"
                :style="{ background: status.color }"
                @click="showColorPicker = !showColorPicker"
            />
            <div
                v-if="showColorPicker"
                class="color-picker-popover"
            >
                <div
                    v-for="c in palette"
                    :key="c"
                    class="color-picker-swatch"
                    :style="{ background: c }"
                    @click="selectColor(c)"
                />
            </div>
        </div>

        <div class="status-row__name">
            <input
                v-if="isEditingStatus"
                ref="inputRef"
                v-model="editName"
                class="status-row__input"
                @blur="commitEdit"
                @keydown="onNameKeydown"
            >
            <span
                v-else
                class="status-row__label"
                :style="{ cursor: locked ? 'default' : 'pointer' }"
                @click="startEdit"
            >{{ status.name }}</span>
        </div>

        <div
            v-if="index === 0"
            class="anchor-pill anchor-pill--start"
        >
            Start
        </div>
        <div
            v-else-if="index === total - 1"
            class="anchor-pill anchor-pill--end"
        >
            End
        </div>

        <div class="status-row__delete-slot">
            <button
                v-if="!locked"
                class="status-row__delete"
                @click="emit('delete')"
            >
                <v-icon
                    icon="mdi-trash-can-outline"
                    :size="13"
                    color="#ba1b24"
                />
            </button>
        </div>
    </div>
</template>

<style scoped>
.status-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 8px 8px 6px;
    border-radius: 8px;
    transition: background 0.1s;
}

.status-row:hover {
    background: rgba(113, 124, 130, 0.07);
}

.status-row__handle {
    width: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.status-row .drag-handle {
    opacity: 0.5;
}

.status-row:hover .drag-handle {
    opacity: 1;
}

.status-row__swatch-wrap {
    position: relative;
    flex-shrink: 0;
}

.status-row__swatch {
    width: 18px;
    height: 18px;
    border-radius: 5px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    cursor: pointer;
}

.color-picker-popover {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    z-index: 10;
    background: white;
    border-radius: 8px;
    padding: 8px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    border: 1px solid rgba(113, 124, 130, 0.16);
}

.color-picker-swatch {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.1s;
}

.color-picker-swatch:hover {
    transform: scale(1.15);
}

.status-row__name {
    flex: 1;
    min-width: 0;
}

.status-row__label {
    display: block;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #2a3439;
}

.status-row__input {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #2a3439;
    border: none;
    background: transparent;
    outline: none;
    width: 100%;
}

.anchor-pill {
    flex-shrink: 0;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 10px;
}

.anchor-pill--start {
    color: #1a7a4a;
    background: rgba(26, 122, 74, 0.1);
}

.anchor-pill--end {
    color: #ba1b24;
    background: rgba(186, 27, 36, 0.08);
}

.status-row__delete-slot {
    width: 28px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.status-row__delete {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.12s;
    visibility: hidden;
}

.status-row:hover .status-row__delete {
    visibility: visible;
}

.status-row__delete:hover {
    background: rgba(186, 27, 36, 0.08);
}
</style>
