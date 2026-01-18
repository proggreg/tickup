<script setup lang="ts">
const colorMode = useColorMode();
const _show = ref(true);
// const { isOnline, isSyncing, pendingCount, syncNow } = useOfflineSync()
</script>

<template>
    <ColorScheme>
        <v-theme-provider
            with-background
            :theme="colorMode.preference"
            class="overflow-auto"
        >
            <v-app full-height>
                <AppToolbar />
                <AppNav />
                <v-main>
                    <!-- <v-snackbar width="10" v-model="show" location="bottom right" timeout="-1">isOnline {{ isOnline }}</v-snackbar> -->
                    <v-container
                        fluid
                        class="pa-0"
                    >
                        <AppSettings />
                        <NuxtPage />
                    </v-container>
                </v-main>
            </v-app>
        </v-theme-provider>
    </ColorScheme>
</template>
