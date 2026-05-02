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
                <v-layout>
                    <app-nav />
                    <v-main>
                        <v-container
                            style="height: 100%"
                            fluid
                        >
                            <v-row>
                                <NuxtPage />
                            </v-row>
                        </v-container>
                    </v-main>
                </v-layout>
            </v-app>
        </v-theme-provider>
    </ColorScheme>
</template>
