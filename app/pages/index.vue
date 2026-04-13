<script setup lang="ts">
definePageMeta({
    layout: 'default',
});
useHead({ title: 'TickUp:Home' });

const tab = ref('todo');
const { mdAndUp } = useDisplay();
</script>

<template>
    <!-- Desktop dashboard -->
    <HomePageDashboard v-if="mdAndUp" />

    <!-- Mobile tabbed view -->
    <div
        v-else
        class="mobile-tabs-page"
    >
        <HomePageTabs v-model="tab" />
        <div class="tab-panels">
            <div
                v-show="tab === 'overdue'"
                class="tab-panel tab-panel--padded"
            >
                <HomePageOverDue />
            </div>
            <div
                v-show="tab === 'todo'"
                class="tab-panel tab-panel--padded-sm"
            >
                <HomePageToday />
            </div>
            <div
                v-show="tab === 'done'"
                class="tab-panel tab-panel--padded"
            >
                <HomePageTodayClosed />
            </div>
        </div>
    </div>
</template>

<style scoped>
.mobile-tabs-page {
    display: flex;
    flex-direction: column;
    min-height: 100%;
}

.tab-panels {
    flex: 1;
}

.tab-panel--padded {
    padding: 0 16px;
}

.tab-panel--padded-sm {
    padding: 0 8px;
}
</style>
