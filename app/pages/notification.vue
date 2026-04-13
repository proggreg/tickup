<script setup lang="ts">
const route = useRoute();
const notificationData = computed(() => {
    try {
        return JSON.parse(decodeURIComponent(route.query.data as string));
    }
    catch {
        return route.query.data;
    }
});
</script>

<template>
    <div class="notification-page">
        <div class="notification-card">
            <div class="notification-card__header">
                <h2 class="notification-card__title">Notification</h2>
            </div>
            <div class="notification-card__body">
                <div v-if="typeof notificationData === 'object'">
                    <pre>{{ notificationData }}</pre>
                </div>
                <div v-else>
                    <p>{{ notificationData }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.notification-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 40px 16px;
}

.notification-card {
    width: 100%;
    max-width: 520px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    background: rgb(var(--v-theme-surface));
}

.notification-card__header {
    background: rgb(var(--v-theme-primary));
    padding: 16px 24px;
}

.notification-card__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #fff;
    margin: 0;
}

.notification-card__body {
    padding: 24px;
}

.notification-card__body pre {
    font-size: 0.875rem;
    white-space: pre-wrap;
    word-break: break-word;
}
</style>
