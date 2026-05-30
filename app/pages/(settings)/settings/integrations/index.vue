<script setup lang="ts">
interface Props {
  icon: string;
  name: string;
  description: string;
  shortDescription?: string;
  connected: boolean;
  accountName?: string;
}

defineProps<Props>();
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <div class="integration-row" @click="emit('click')">
    <div class="integration-row__icon-tile">
      <v-icon :icon="icon" :size="20" color="#2a3439" />
    </div>

    <div class="integration-row__text">
      <div class="integration-row__name-row">
        <span class="integration-row__name">{{ name }}</span>
        <span v-if="connected" class="connected-pill">
          <span class="connected-pill__dot" />
          Connected
        </span>
      </div>
      <div class="integration-row__description">
        <template v-if="connected && accountName">
          {{ accountName }} ·
        </template>{{ shortDescription || description }}
      </div>
    </div>

    <div class="integration-row__action">
      <v-icon v-if="connected" icon="mdi-chevron-right" :size="18" style="color: rgba(42, 52, 57, 0.42)" />
      <button v-else class="connect-btn" @click.stop="emit('click')">
        Connect
      </button>
    </div>
  </div>
</template>

<style scoped>
.integration-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.12s;
}

.integration-row:hover {
  background: rgba(113, 124, 130, 0.07);
}

.integration-row__icon-tile {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--color-surface-low, #f0f4f7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.integration-row__text {
  flex: 1;
  min-width: 0;
}

.integration-row__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.integration-row__name {
  font-family: 'Manrope', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #2a3439;
}

.integration-row__description {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: rgba(42, 52, 57, 0.62);
  margin-top: 2px;
}

.connected-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #1a7a4a;
  background: rgba(26, 122, 74, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.connected-pill__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #1a7a4a;
  flex-shrink: 0;
}

.integration-row__action {
  flex-shrink: 0;
}

.connect-btn {
  padding: 5px 14px;
  border-radius: 7px;
  border: 1px solid rgba(113, 124, 130, 0.28);
  background: white;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #2a3439;
  cursor: pointer;
  transition: background 0.12s;
}

.connect-btn:hover {
  background: rgba(113, 124, 130, 0.07);
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
