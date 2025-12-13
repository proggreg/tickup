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
    <v-container
        class="py-10 d-flex justify-center align-center"
        style="min-height: 80vh;"
    >
        <v-card
            elevation="4"
            max-width="520"
            class="w-100 rounded-xl"
        >
            <v-toolbar
                color="primary"
                dark
                flat
                class="rounded-t-xl"
            >
                <v-toolbar-title class="text-h5">
                    Notification
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text class="pa-6">
                <div v-if="typeof notificationData === 'object'">
                    <pre>{{ notificationData }}</pre>
                </div>
                <div v-else>
                    <p>{{ notificationData }}</p>
                </div>
            </v-card-text>
        </v-card>
    </v-container>
</template>
