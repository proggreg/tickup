<script setup lang="ts">
const colorMode = useColorMode();
</script>

<template>
    <ColorScheme>
        <v-theme-provider
            with-background
            :theme="colorMode.preference"
        >
            <v-app full-height>
                <app-nav />
                <v-main>
                    <v-container
                        class="fill-height px-8 py-4"
                        fluid
                    >
                        <NuxtPage />
                    </v-container>
                </v-main>
            </v-app>
        </v-theme-provider>
    </ColorScheme>
</template>
