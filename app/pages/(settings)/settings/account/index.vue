<script setup lang="ts">
interface Props {
  icon: string;
  label: string;
  value?: string;
  action?: string;
  actionIcon?: string;
  danger?: boolean;
}

defineProps<Props>();
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <div class="account-row" :class="{ 'account-row--danger': danger }" @click="emit('click')">
    <div class="account-row__icon-tile" :class="{ 'account-row__icon-tile--danger': danger }">
      <v-icon :icon="icon" :size="16" :style="{ color: danger ? '#ba1b24' : 'rgba(42,52,57,0.62)' }" />
    </div>

    <div class="account-row__text">
      <div class="account-row__label" :class="{ 'account-row__label--danger': danger }">
        {{ label }}
      </div>
      <div v-if="value" class="account-row__value">
        {{ value }}
      </div>
    </div>

    <div class="account-row__action">
      <span v-if="action" class="account-row__action-text">{{ action }}</span>
      <v-icon v-if="actionIcon" :icon="actionIcon" :size="16"
        :style="{ color: danger ? '#ba1b24' : 'rgba(42,52,57,0.42)' }" />
    </div>
  </div>
</template>

<style scoped>
.account-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.12s;
}

.account-row:hover {
  background: rgba(113, 124, 130, 0.07);
}

.account-row--danger:hover {
  background: rgba(186, 27, 36, 0.08);
}

.account-row__icon-tile {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  background: var(--color-surface-low, #f0f4f7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.account-row__icon-tile--danger {
  background: rgba(186, 27, 36, 0.08);
}

.account-row__text {
  flex: 1;
  min-width: 0;
}

.account-row__label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #2a3439;
}

.account-row__label--danger {
  color: #ba1b24;
}

.account-row__value {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: rgba(42, 52, 57, 0.62);
  margin-top: 1px;
}

.account-row__action {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.account-row__action-text {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary, #005ac2);
}
</style>
