<script setup lang="ts">
const colorMode = useColorMode();
const route = useRoute();
const dialog = useDialog();

function addEventHandler() {
    if (route.name === 'lists') {
        dialog.value.page = 'list';
    }
    else if (route.name === 'index' || route.name === 'list-id') {
        dialog.value.page = 'todo';
    }

    dialog.value.open = true;
}

const showFab = computed(() => {
    return route.name === 'lists' || route.name === 'list-id' || route.name === 'index';
});
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
                    </v-container>
                </v-main>
                <v-fab
                    v-if="showFab"
                    app
                    size="small"
                    position="relative"
                    location="bottom end"
                    style="bottom: 50px;"
                    elevation="12"
                    color="primary"
                    append-icon="mdi-plus"
                    variant="elevated"
                    extended
                    text="New"
                    @click="addEventHandler"
                />
                <AppNavMobile />
            </v-app>
        </v-theme-provider>
    </ColorScheme>
</template>
