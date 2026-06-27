<script setup lang="ts">
const colorMode = useColorMode();
</script>

<template>
    <ColorScheme>
        <v-theme-provider
            with-background
            :theme="colorMode.preference"
        >
            <v-app>
                <v-main>
                    <v-container
                        class="pa-0"
                        fluid
                    >
                        <NuxtPage />
                        <AppNavMobile />
                    </v-container>
                </v-main>
            </v-app>
        </v-theme-provider>
    </ColorScheme>
</template>
