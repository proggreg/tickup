<template>
    <div class="empty-state">
        <i class="mdi mdi-check-circle empty-state__icon" />
        <slot />
        <div class="empty-state__headline">
            All Done For Now!
        </div>
        <div class="empty-state__title">
            You're all caught up.
        </div>
        <div class="empty-state__text">
            Great job on completing all your tasks! This might be a good time to relax or consider planning your
            next set of goals. If you think of something new, just hit the button below to add a new task.
        </div>
    </div>
</template>

<style scoped>
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 48px 24px;
    height: 100%;
    gap: 8px;
    color: rgb(var(--v-theme-on-surface));
}

.empty-state__icon {
    font-size: 64px;
    color: rgba(var(--v-theme-on-surface), 0.38);
    margin-bottom: 8px;
}

.empty-state__headline {
    font-size: 2rem;
    font-weight: 400;
    line-height: 1.2;
}

.empty-state__title {
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.4;
}

.empty-state__text {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.6);
    max-width: 480px;
    line-height: 1.5;
}
</style>
