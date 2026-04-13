<script setup lang="ts">
interface Props {
    title: string;
    icon?: string;
    description?: string;
    statusLabel?: string;
    statusColor?: string;
    testId?: string;
}

const props = defineProps<Props>();

const statusColorVar = computed(() => {
    if (!props.statusColor) return null;
    const map: Record<string, string> = {
        success: '--v-theme-success',
        error: '--v-theme-error',
        warning: '--v-theme-warning',
        primary: '--v-theme-primary',
    };
    return map[props.statusColor] || null;
});
</script>

<template>
    <div
        class="settings-column"
        :data-testid="props.testId"
    >
        <div class="settings-card">
            <div class="settings-card__header">
                <div class="settings-card__title-group">
                    <i
                        v-if="props.icon"
                        :class="`mdi ${props.icon} settings-card__icon`"
                    />
                    <span class="settings-card__title">{{ props.title }}</span>
                </div>
                <span
                    v-if="props.statusLabel"
                    class="settings-badge"
                    :style="statusColorVar ? { background: `rgba(var(${statusColorVar}), 0.12)`, color: `rgb(var(${statusColorVar}))` } : {}"
                >
                    {{ props.statusLabel }}
                </span>
            </div>

            <p
                v-if="props.description"
                class="settings-card__desc"
            >
                {{ props.description }}
            </p>

            <div class="settings-card__body">
                <slot />
            </div>

            <div class="settings-card__footer">
                <slot name="actions" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-column {
    width: 100%;
    padding: 0 8px;
    margin-bottom: 16px;
    box-sizing: border-box;
}

@media (min-width: 960px) {
    .settings-column {
        width: 50%;
    }
}

@media (min-width: 1280px) {
    .settings-column {
        width: 33.333%;
    }
}

.settings-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    border-radius: 8px;
    background: rgb(var(--v-theme-surface));
}

.settings-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.settings-card__title-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.settings-card__icon {
    font-size: 20px;
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.settings-card__title {
    font-size: 0.9375rem;
    font-weight: 500;
}

.settings-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 500;
    background: rgba(var(--v-border-color), 0.12);
    color: rgba(var(--v-theme-on-surface), 0.7);
}

.settings-card__desc {
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin: 0 0 12px;
    line-height: 1.4;
}

.settings-card__body {
    flex: 1;
    padding-bottom: 12px;
}

.settings-card__footer {
    margin-top: auto;
}
</style>
