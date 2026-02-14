<script setup lang="ts">
const colorMode = useColorMode();
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
                    <AppSettings />
                    <NuxtPage />
                </v-main>
            </v-app>
        </v-theme-provider>
    </ColorScheme>
</template>
