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
                    <v-main>
                        <v-container class="fill-height flex justify-center">
                            <NuxtPage />
                        </v-container>
                    </v-main>
                </v-layout>
            </v-app>
        </v-theme-provider>
    </ColorScheme>
</template>
