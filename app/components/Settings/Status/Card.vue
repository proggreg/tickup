<script setup lang="ts">
const store = useSettingsStore();
const palette = usePalette()

function canMove(evt: { draggedContext: { index: number }; relatedContext: { index: number } }) {
  const di = evt.draggedContext.index;
  const ri = evt.relatedContext.index;
  const last = store.userStatuses.length - 1;
  return di !== 0 && di !== last && ri !== 0 && ri !== last;
}

function updateStatusName(index: number, name: string) {
  store.userStatuses[index].name = name;
}

function updateStatusColor(index: number, color: string) {
  store.userStatuses[index].color = color;
}

function isLocked(index: number): 'start' | 'end' | false {
  if (index === 0) return 'start';
  if (index === store.userStatuses.length - 1) return 'end';
  return false;
}

function deleteStatus(index: number) {
  if (index > 0 && index < store.userStatuses.length - 1) {
    store.userStatuses.splice(index, 1);
  }
}

function addStatus() {
  const insertAt = store.userStatuses.length - 1;
  const prev = store.userStatuses[insertAt - 1];
  if (prev?.name === '') {
    prev.Edit = true;
    return;
  }
  const color = palette[Math.floor(Math.random() * palette.value.length)];
  store.userStatuses.splice(insertAt, 0, { name: 'New status', color, Edit: false });
}
</script>
<template>
  <v-card class="settings-card">
    <draggable :list="store.userStatuses" item-key="name" handle=".drag-handle" :move="canMove">
      <template #item="{ element: status, index: i }">
        <SettingsStatusRow :status="status" :index="i" :total="store.userStatuses.length" :locked="isLocked(i)"
          @update:name="updateStatusName(i, $event)" @update:color="updateStatusColor(i, $event)"
          @delete="deleteStatus(i)" />
      </template>
    </draggable>
    <button class="add-status-btn" @click="addStatus">
      <v-icon icon="mdi-plus" :size="16" />
      Add status
    </button>
  </v-card>
</template>

<style scoped>
.add-status-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  margin-top: 2px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary, #005ac2);
  transition: background 0.12s;
  text-align: left;
}

.add-status-btn:hover {
  background: rgba(113, 124, 130, 0.07);
}
</style>