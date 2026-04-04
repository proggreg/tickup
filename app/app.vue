<script setup lang="ts">
const listsStore = useListsStore();
const _settingsStore = useSettingsStore();
const config = useRuntimeConfig();
const event = useRequestEvent();
const dialog = useDialog();
const error = useError();
const { show: showNotification, message: notificationMessage, link: notificationLink, notify } = useNotification();

useShortcutKeys();

const showErrorToast = computed(() => !!error.value);
const errorMessage = computed(() => {
    if (!error.value) return '';
    console.error(error.value);

    // Handle Nuxt error object structure
    if (error.value && typeof error.value === 'object') {
        if ('statusMessage' in error.value) {
            return String(error.value.statusMessage);
        }
        if ('message' in error.value) {
            return String(error.value.message);
        }
    }

    return error.value instanceof Error ? error.value.message : String(error.value);
});

function dismissError() {
    clearError();
}

if (import.meta.server && config.public.VERCEL_ENV === 'production' && event?.headers.get('host')
    && !event?.headers.get('host')?.includes('tickup.gregfield.dev')) {
    navigateTo('https://tickup.gregfield.dev/login', { external: true });
}

async function addTodo() {
    const todo = await listsStore.addTodo();
    if (todo.id) {
        dialog.value.open = false;
        notify('Todo Created', { link: `/todo/${todo.id}` });
    }
}
</script>

<template>
    <div>
        <NuxtPwaManifest />
        <v-snackbar
            v-model="showErrorToast"
            color="error"
            location="top"
            timeout="5000"
        >
            {{ errorMessage }}
            <template #actions>
                <v-btn
                    variant="text"
                    @click="dismissError"
                >
                    Close
                </v-btn>
            </template>
        </v-snackbar>
        <v-snackbar
            v-model="showNotification"
            location="bottom right"
            timeout="2000"
        >
            {{ notificationMessage }}
            <template
                v-if="notificationLink"
                #actions
            >
                <v-btn
                    variant="text"
                    :to="notificationLink"
                >
                    View
                </v-btn>
            </template>
        </v-snackbar>
        <AppDialog
            page="todo"
            title="New Todo"
        >
            <TodoNew />
            <template #buttons>
                <v-btn
                    color="primary"
                    :disabled="listsStore.newTodo.name === ''"
                    data-testid="create-todo-button"
                    @click="addTodo"
                >
                    Create
                </v-btn>
            </template>
        </AppDialog>
        <NuxtLayout :name="useAppLayout()">
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<style>
* {
    scrollbar-width: none;
}

*::-webkit-scrollbar {
    display: none;
}

.layout-enter-active,
  .layout-leave-active {
    transition: all 0.4s;
  }

  .layout-enter-from,
  .layout-leave-to {
    filter: grayscale(1);
  }
</style>
