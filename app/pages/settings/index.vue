<script setup lang="ts">
definePageMeta({
    layout: 'mobile',
});
const supabase = useSupabaseClient();
const store = useSettingsStore();
const route = useRoute();
const githubConnected = ref(false);
const githubLoading = ref(false);

async function checkGithubStatus() {
    githubLoading.value = true;
    try {
        const connected = await $fetch('/api/github/check');
        githubConnected.value = !!connected;
    } catch {
        githubConnected.value = false;
    }
    githubLoading.value = false;
}

await useAsyncData(() => store.getUserSettings().then(() => true));

function getRandomHexColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function isMiddle(index: number) {
    return index > 0 && index < store.userStatuses.length - 1;
}

function canMove(evt: { draggedContext: { index: number }; relatedContext: { index: number } }) {
    const di = evt.draggedContext.index;
    const ri = evt.relatedContext.index;
    const last = store.userStatuses.length - 1;
    return di !== 0 && di !== last && ri !== 0 && ri !== last;
}

function addStatus() {
    const insertAt = store.userStatuses.length - 1;
    const prev = store.userStatuses[insertAt - 1];
    if (prev?.name === '') {
        prev.Edit = true;
        return;
    }
    store.userStatuses.splice(insertAt, 0, { name: '', color: getRandomHexColor(), Edit: true });
}

async function save() {
    for (let i = store.userStatuses.length - 2; i >= 1; i--) {
        if (store.userStatuses[i].name === '') {
            store.userStatuses.splice(i, 1);
        }
    }
    store.userStatuses.forEach((s) => {
        s.Edit = false;
    });

    await $fetch('/api/settings', {
        method: 'PUT',
        body: { statuses: store.userStatuses },
    });
}

function deleteStatus(status: Status) {
    const idx = store.userStatuses.indexOf(status);
    if (idx > 0 && idx < store.userStatuses.length - 1) {
        store.userStatuses.splice(idx, 1);
        save();
    }
}

async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error(error);
        return;
    }
    navigateTo('login');
}

onMounted(async () => {
    // Handle pending GitHub connection (redirected from callback when server-side auth wasn't available)
    if (route.query.github === 'pending' && route.query.installation_id) {
        githubLoading.value = true;
        try {
            await $fetch('/api/github/connect', {
                method: 'POST',
                body: {
                    installation_id: route.query.installation_id,
                    code: route.query.code || undefined,
                },
            });
            githubConnected.value = true;
        } catch (e) {
            console.error('Failed to complete GitHub connection:', e);
        }
        githubLoading.value = false;
    } else {
        await checkGithubStatus();
        if (route.query.github === 'connected') {
            githubConnected.value = true;
        }
    }
});
</script>

<template>
    <div class="d-flex flex-column h-100 pb-20">
        <div class="d-flex align-center ga-3 px-5 pt-8 pb-4 flex-shrink-0">
            <span class="text-h5 font-weight-bold">Settings</span>
        </div>

        <div class="flex-grow-1" style="overflow-y: auto">
            <!-- Statuses -->
            <div
                class="text-caption text-medium-emphasis text-uppercase font-weight-medium px-5 mb-2"
            >
                Statuses
            </div>

            <v-list class="px-3 bg-transparent mb-2">
                <draggable
                    :list="store.userStatuses"
                    item-key="name"
                    handle=".drag-handle"
                    :move="canMove"
                >
                    <template #item="{ element: status, index }">
                        <v-list-item
                            :key="status.name"
                            rounded="xl"
                            class="mb-2"
                            base-color="surface-variant"
                            variant="tonal"
                            min-height="62"
                        >
                            <template #prepend>
                                <v-icon
                                    v-if="isMiddle(index)"
                                    icon="mdi-drag"
                                    class="drag-handle mr-1 text-disabled"
                                    style="cursor: grab"
                                />
                                <v-icon
                                    v-else
                                    icon="mdi-lock-outline"
                                    class="mr-1 text-disabled"
                                    size="small"
                                />
                                <v-menu :close-on-content-click="false">
                                    <template #activator="{ props }">
                                        <v-btn
                                            v-bind="props"
                                            min-width="32"
                                            size="small"
                                            :color="status.color"
                                            variant="flat"
                                            class="mr-2"
                                            rounded="lg"
                                            :title="`Color: ${status.color}`"
                                        />
                                    </template>
                                    <v-color-picker
                                        v-model="status.color"
                                        class="ma-4"
                                        show-swatches
                                    />
                                </v-menu>
                            </template>

                            <v-text-field
                                v-if="status.Edit"
                                v-model="status.name"
                                density="compact"
                                variant="plain"
                                autofocus
                                hide-details
                                class="font-weight-bold"
                            />
                            <v-list-item-title
                                v-else
                                class="font-weight-bold"
                                style="cursor: pointer"
                                @click="status.Edit = true"
                            >
                                {{ status.name }}
                            </v-list-item-title>

                            <template #append>
                                <v-chip
                                    v-if="index === 0"
                                    size="x-small"
                                    variant="tonal"
                                    color="success"
                                    class="mr-1"
                                >
                                    Start
                                </v-chip>
                                <v-chip
                                    v-else-if="index === store.userStatuses.length - 1"
                                    size="x-small"
                                    variant="tonal"
                                    color="error"
                                    class="mr-1"
                                >
                                    End
                                </v-chip>
                                <v-menu v-if="isMiddle(index)">
                                    <template #activator="{ props }">
                                        <v-btn
                                            v-bind="props"
                                            icon="mdi-dots-vertical"
                                            variant="text"
                                            size="small"
                                            @click.stop
                                        />
                                    </template>
                                    <v-list>
                                        <v-list-item
                                            append-icon="mdi-delete"
                                            class="text-red"
                                            @click.passive="deleteStatus(status)"
                                        >
                                            <v-list-item-title class="text-body-2">
                                                Delete
                                            </v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </template>
                        </v-list-item>
                    </template>
                </draggable>
            </v-list>

            <div class="d-flex ga-2 px-4 mb-6">
                <v-btn variant="tonal" prepend-icon="mdi-plus" rounded="xl" @click="addStatus">
                    Add Status
                </v-btn>
                <v-btn color="primary" variant="tonal" rounded="xl" @click="save"> Save </v-btn>
            </div>

            <!-- Integrations -->
            <div
                class="text-caption text-medium-emphasis text-uppercase font-weight-medium px-5 mb-2"
            >
                Integrations
            </div>

            <v-list class="px-3 bg-transparent mb-6">
                <v-list-item
                    to="/settings/github"
                    rounded="xl"
                    base-color="surface-variant"
                    variant="tonal"
                    min-height="62"
                    class="mb-2"
                >
                    <template #prepend>
                        <v-icon icon="mdi-github" size="18" class="mr-3" />
                    </template>

                    <v-list-item-title class="font-weight-bold">
                        GitHub Integration
                    </v-list-item-title>
                    <v-list-item-subtitle v-if="githubLoading" class="text-caption">
                        Checking...
                    </v-list-item-subtitle>
                    <v-list-item-subtitle
                        v-else-if="githubConnected"
                        class="text-caption text-success"
                    >
                        Connected
                    </v-list-item-subtitle>
                    <v-list-item-subtitle v-else class="text-caption text-medium-emphasis">
                        Not connected
                    </v-list-item-subtitle>

                    <template #append>
                        <v-icon icon="mdi-chevron-right" size="18" />
                    </template>
                </v-list-item>
            </v-list>

            <!-- Account -->
            <div
                class="text-caption text-medium-emphasis text-uppercase font-weight-medium px-5 mb-2"
            >
                Account
            </div>

            <v-list class="px-3 bg-transparent">
                <v-list-item
                    rounded="xl"
                    base-color="surface-variant"
                    variant="tonal"
                    min-height="62"
                    @click="signOut"
                >
                    <template #prepend>
                        <v-icon icon="mdi-logout" size="18" class="mr-3" />
                    </template>
                    <v-list-item-title class="font-weight-bold text-error">
                        Sign Out
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </div>
    </div>
</template>
