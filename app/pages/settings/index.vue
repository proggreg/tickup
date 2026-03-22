<script setup lang="ts">
definePageMeta({
    layout: 'mobile',
});
const supabase = useSupabaseClient();
const { userId } = useCurrentUser();
const store = useSettingsStore();
const route = useRoute();
const githubConnected = ref(false);
const githubLoading = ref(false);

async function checkGithubStatus() {
    githubLoading.value = true;
    try {
        const connected = await $fetch('/api/github/check');
        githubConnected.value = !!connected;
    }
    catch {
        githubConnected.value = false;
    }
    githubLoading.value = false;
}

await useAsyncData(() => store.getUserSettings().then(() => true));

const options = reactive([{
    name: 'Delete',
    handler: deleteStatus,
    icon: 'mdi-delete',
    destructive: true,
}]);

function getRandomHexColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function addStatus() {
    const top = store.statuses[store.statuses.length - 1];

    if (top.name === '') {
        store.statuses[store.statuses.length - 1].Edit = true;
        return;
    }
    const randomColor = getRandomHexColor();

    store.statuses.push({ name: '', color: randomColor, Edit: true });
}

async function save() {
    for (let i = 0; i < store.statuses.length; i++) {
        if (store.statuses[i].Edit) {
            store.statuses[i].Edit = false;
        }
        if (store.statuses[i].name === '') {
            store.statuses.splice(i, 1);
        }
    }

    await $fetch('/api/settings', {
        method: 'PUT',
        body: { userId: userId.value, statuses: store.statuses },
    });
}

function deleteStatus(status: Status) {
    store.statuses.splice(store.statuses.indexOf(status), 1);
    save();
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
        }
        catch (e) {
            console.error('Failed to complete GitHub connection:', e);
        }
        githubLoading.value = false;
    }
    else {
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

        <div
            class="px-3 flex-grow-1"
            style="overflow-y: auto;"
        >
            <!-- Statuses -->
            <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium px-2 mb-2">
                Statuses
            </div>

            <div
                v-if="store.statuses.length === 0"
                class="d-flex flex-column align-center justify-center pa-8 text-center mb-4"
            >
                <v-icon
                    icon="mdi-tag-outline"
                    size="48"
                    class="text-disabled mb-3"
                />
                <p class="text-body-2 text-disabled">
                    No statuses yet
                </p>
            </div>

            <v-list
                v-else
                class="bg-transparent mb-2"
                :lines="false"
            >
                <v-list-item
                    v-for="status in store.statuses"
                    :key="status.name"
                    rounded="xl"
                    class="mb-2"
                    base-color="surface-variant"
                    variant="tonal"
                    min-height="62"
                >
                    <template #prepend>
                        <v-menu :close-on-content-click="false">
                            <template #activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    min-width="28"
                                    size="small"
                                    :color="status.color"
                                    class="mr-2"
                                    rounded="lg"
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
                    >
                        {{ status.name }}
                    </v-list-item-title>

                    <template #append>
                        <v-menu>
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
                                    v-for="(option, index) in options"
                                    :key="index"
                                    :value="option.name"
                                    :append-icon="option.icon"
                                    :class="option.destructive ? 'text-red' : ''"
                                    @click.passive="option.handler(status)"
                                >
                                    <v-list-item-title class="text-body-2">
                                        {{ option.name }}
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </template>
                </v-list-item>
            </v-list>

            <div class="d-flex ga-2 px-1 mb-6">
                <v-btn
                    variant="tonal"
                    prepend-icon="mdi-plus"
                    rounded="xl"
                    @click="addStatus"
                >
                    Add Status
                </v-btn>
                <v-btn
                    color="primary"
                    variant="tonal"
                    rounded="xl"
                    @click="save"
                >
                    Save
                </v-btn>
            </div>

            <!-- Integrations -->
            <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium px-2 mb-2">
                Integrations
            </div>

            <v-list
                class="bg-transparent px-0 mb-6"
                :lines="false"
            >
                <v-list-item
                    to="/settings/github"
                    rounded="xl"
                    base-color="surface-variant"
                    variant="tonal"
                    min-height="62"
                    class="mb-2"
                >
                    <template #prepend>
                        <v-icon
                            icon="mdi-github"
                            size="18"
                            class="mr-1"
                        />
                    </template>

                    <v-list-item-title class="font-weight-bold">
                        GitHub Integration
                    </v-list-item-title>
                    <v-list-item-subtitle
                        v-if="githubLoading"
                        class="text-caption"
                    >
                        Checking...
                    </v-list-item-subtitle>
                    <v-list-item-subtitle
                        v-else-if="githubConnected"
                        class="text-caption text-success"
                    >
                        Connected
                    </v-list-item-subtitle>
                    <v-list-item-subtitle
                        v-else
                        class="text-caption text-medium-emphasis"
                    >
                        Not connected
                    </v-list-item-subtitle>

                    <template #append>
                        <v-icon
                            icon="mdi-chevron-right"
                            size="18"
                        />
                    </template>
                </v-list-item>
            </v-list>

            <!-- Account -->
            <div class="text-caption text-medium-emphasis text-uppercase font-weight-medium px-2 mb-2">
                Account
            </div>

            <v-list
                class="bg-transparent px-0"
                :lines="false"
            >
                <v-list-item
                    rounded="xl"
                    base-color="surface-variant"
                    variant="tonal"
                    min-height="62"
                    @click="signOut"
                >
                    <template #prepend>
                        <v-icon
                            icon="mdi-logout"
                            size="18"
                            class="mr-1"
                        />
                    </template>
                    <v-list-item-title class="font-weight-bold text-error">
                        Sign Out
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </div>
    </div>
</template>
