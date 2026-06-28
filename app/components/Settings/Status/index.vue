<script setup lang="ts">
const store = useSettingsStore();
const isSaving = ref(false);

async function save() {
    isSaving.value = true;
    for (let i = store.userStatuses.length - 2; i >= 1; i--) {
        if (store.userStatuses[i].name === '') {
            store.userStatuses.splice(i, 1);
        }
    }
    await $fetch('/api/settings', {
        method: 'PUT',
        body: { statuses: store.userStatuses },
    });
    savedStatuses.value = store.userStatuses.map(s => ({ ...s }));
    isSaving.value = false;
}

const savedStatuses = ref<Status[]>(store.userStatuses.map(s => ({ ...s })));

const isDirty = computed(() => {
    const curr = store.userStatuses;
    const saved = savedStatuses.value;
    if (curr.length !== saved.length) return true;
    return curr.some((s, i) => s.name !== saved[i]?.name || s.color !== saved[i]?.color);
});

function discard() {
    store.userStatuses.splice(
        0,
        store.userStatuses.length,
        ...savedStatuses.value.map(s => ({ ...s })),
    );
}
</script>

<template>
    <SettingsStatusCard />

    <div class="save-row">
        <button
            v-if="isDirty"
            class="btn-discard"
            @click="discard"
        >
            Discard
        </button>
        <button
            class="btn-save"
            :class="{ 'btn-save--clean': !isDirty }"
            :disabled="!isDirty || isSaving"
            @click="save"
        >
            Save changes
        </button>
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

/* ── Shared ── */
.settings-card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow:
    0 1px 2px rgba(42, 52, 57, 0.04),
    0 0 0 1px rgba(113, 124, 130, 0.1);
  padding: 4px;
  overflow: hidden;
}

.settings-card--mobile {
  border-radius: 12px;
}

.card-divider {
  height: 1px;
  background: rgba(113, 124, 130, 0.16);
  margin-left: 52px;
}

.section-header {
  margin-bottom: 24px;
}

.section-header__title {
  font-family: 'Manrope', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #2a3439;
  margin: 0 0 4px;
}

.section-header__desc {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: rgba(42, 52, 57, 0.62);
  max-width: 520px;
  line-height: 1.5;
  margin: 0;
}

.coming-soon {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: rgba(42, 52, 57, 0.62);
}

/* ── Desktop ── */
.settings-desktop {
  display: flex;
  min-height: 100%;
  background: var(--color-background, #f7f9fb);
}

.settings-desktop__main {
  flex: 1;
  overflow-y: auto;
  padding: 36px 44px;
  background: var(--color-background, #f7f9fb);
}

.save-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}

.btn-discard {
  padding: 8px 16px;
  border-radius: 7px;
  border: 1px solid rgba(113, 124, 130, 0.28);
  background: white;
  color: #2a3439;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;
}

.btn-discard:hover {
  background: rgba(113, 124, 130, 0.07);
}

.btn-save {
  padding: 8px 20px;
  border-radius: 7px;
  border: none;
  background: var(--color-primary, #005ac2);
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.12s,
    color 0.12s;
}

.btn-save--clean,
.btn-save:disabled {
  background: var(--color-surface-low, #f0f4f7);
  color: rgba(42, 52, 57, 0.42);
  cursor: default;
}

/* ── Mobile ── */
.settings-mobile {
  padding: 24px 20px 80px;
  background: var(--color-background, #f7f9fb);
  min-height: 100%;
}

.settings-mobile__title {
  font-family: 'Manrope', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #2a3439;
  letter-spacing: -0.01em;
  margin: 0 0 24px;
}

.mobile-section {
  margin-bottom: 20px;
}

.mobile-section__label {
  font-family: 'Manrope', sans-serif;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(42, 52, 57, 0.62);
  padding: 0 4px 8px;
}

.mobile-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(113, 124, 130, 0.16);
  padding: 8px 12px;
}

.mobile-add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary, #005ac2);
  cursor: pointer;
  padding: 0;
}

.mobile-save-btn {
  padding: 6px 14px;
  border-radius: 7px;
  border: none;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: rgba(42, 52, 57, 0.42);
  cursor: default;
  transition:
    background 0.12s,
    color 0.12s;
}

.mobile-save-btn--dirty {
  background: var(--color-primary, #005ac2);
  color: white;
  cursor: pointer;
}
</style>
