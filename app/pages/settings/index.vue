<script setup lang="ts">
import { Button, Input, Popover } from '@vuetify/v0';

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
    <div class="settings-page">
        <div class="settings-page__heading">
            <span class="settings-page__title">Settings</span>
        </div>

        <div class="settings-page__body">
            <!-- Statuses -->
            <div class="section-label">Statuses</div>

            <div
                v-if="store.statuses.length === 0"
                class="empty-state"
            >
                <i class="mdi mdi-tag-outline empty-state__icon" />
                <p class="empty-state__text">No statuses yet</p>
            </div>

            <ul
                v-else
                class="status-list"
            >
                <li
                    v-for="status in store.statuses"
                    :key="status.name"
                    class="status-item"
                >
                    <Popover.Root :close-on-content-click="false">
                        <Popover.Activator>
                            <button
                                class="color-swatch"
                                :style="{ background: status.color }"
                                aria-label="Pick color"
                            />
                        </Popover.Activator>
                        <Popover.Content>
                            <div class="color-picker-popup">
                                <input
                                    v-model="status.color"
                                    type="color"
                                    class="color-native-picker"
                                >
                            </div>
                        </Popover.Content>
                    </Popover.Root>

                    <Input.Root
                        v-if="status.Edit"
                        v-model="status.name"
                    >
                        <Input.Control
                            class="status-name-input"
                            autofocus
                        />
                    </Input.Root>
                    <span
                        v-else
                        class="status-name"
                    >{{ status.name }}</span>

                    <div class="status-item__actions">
                        <Popover.Root>
                            <Popover.Activator>
                                <Button.Root
                                    class="icon-btn"
                                    @click.stop
                                >
                                    <Button.Icon>
                                        <i class="mdi mdi-dots-vertical" />
                                    </Button.Icon>
                                </Button.Root>
                            </Popover.Activator>
                            <Popover.Content>
                                <ul class="menu-list">
                                    <li
                                        v-for="(option, index) in options"
                                        :key="index"
                                        class="menu-item"
                                        :class="{ 'menu-item--danger': option.destructive }"
                                        @click="option.handler(status)"
                                    >
                                        <i :class="`mdi ${option.icon}`" />
                                        {{ option.name }}
                                    </li>
                                </ul>
                            </Popover.Content>
                        </Popover.Root>
                    </div>
                </li>
            </ul>

            <div class="status-actions">
                <Button.Root
                    class="btn"
                    @click="addStatus"
                >
                    <Button.Icon>
                        <i class="mdi mdi-plus" />
                    </Button.Icon>
                    Add Status
                </Button.Root>
                <Button.Root
                    class="btn btn--primary"
                    @click="save"
                >
                    Save
                </Button.Root>
            </div>

            <!-- Integrations -->
            <div class="section-label">Integrations</div>

            <ul class="integration-list">
                <li class="integration-item">
                    <NuxtLink
                        to="/settings/github"
                        class="integration-link"
                    >
                        <i class="mdi mdi-github integration-link__icon" />
                        <div class="integration-link__body">
                            <span class="integration-link__title">GitHub Integration</span>
                            <span
                                v-if="githubLoading"
                                class="integration-link__status"
                            >Checking...</span>
                            <span
                                v-else-if="githubConnected"
                                class="integration-link__status integration-link__status--success"
                            >Connected</span>
                            <span
                                v-else
                                class="integration-link__status"
                            >Not connected</span>
                        </div>
                        <i class="mdi mdi-chevron-right integration-link__chevron" />
                    </NuxtLink>
                </li>
            </ul>

            <!-- Account -->
            <div class="section-label">Account</div>

            <ul class="integration-list">
                <li class="integration-item">
                    <button
                        class="integration-link integration-link--btn"
                        @click="signOut"
                    >
                        <i class="mdi mdi-logout integration-link__icon" />
                        <span class="integration-link__title integration-link__title--danger">Sign Out</span>
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.settings-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-bottom: 80px;
}

.settings-page__heading {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 32px 20px 16px;
    flex-shrink: 0;
}

.settings-page__title {
    font-size: 1.5rem;
    font-weight: 700;
}

.settings-page__body {
    flex: 1;
    overflow-y: auto;
}

.section-label {
    font-size: 0.7rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(var(--v-theme-on-surface), 0.5);
    padding: 0 20px;
    margin-bottom: 8px;
    margin-top: 8px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    text-align: center;
    margin-bottom: 16px;
}

.empty-state__icon {
    font-size: 48px;
    color: rgba(var(--v-theme-on-surface), 0.3);
    margin-bottom: 8px;
}

.empty-state__text {
    font-size: 0.875rem;
    color: rgba(var(--v-theme-on-surface), 0.4);
    margin: 0;
}

.status-list {
    list-style: none;
    margin: 0;
    padding: 0 12px;
    margin-bottom: 8px;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    background: rgba(var(--v-border-color), 0.06);
    margin-bottom: 8px;
    min-height: 62px;
}

.color-swatch {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 2px solid rgba(var(--v-border-color), 0.2);
    cursor: pointer;
    flex-shrink: 0;
    transition: transform 0.15s;
}

.color-swatch:hover {
    transform: scale(1.1);
}

.color-picker-popup {
    padding: 12px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.color-native-picker {
    width: 200px;
    height: 160px;
    border: none;
    padding: 0;
    cursor: pointer;
    background: transparent;
}

.status-name {
    flex: 1;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.status-name-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    color: inherit;
    padding: 2px 0;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.38);
}

.status-item__actions {
    flex-shrink: 0;
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
    transition: background 0.1s;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn .mdi {
    font-size: 18px;
}

.menu-list {
    list-style: none;
    margin: 0;
    padding: 4px;
    min-width: 120px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 0.875rem;
    border-radius: 4px;
    transition: background 0.1s;
}

.menu-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.menu-item--danger {
    color: rgb(var(--v-theme-error));
}

.menu-item--danger:hover {
    background: rgba(var(--v-theme-error), 0.08);
}

.status-actions {
    display: flex;
    gap: 8px;
    padding: 0 16px 24px;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: 12px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    background: rgba(var(--v-border-color), 0.1);
    color: inherit;
    transition: background 0.15s;
}

.btn:hover {
    background: rgba(var(--v-border-color), 0.18);
}

.btn--primary {
    background: rgba(var(--v-theme-primary), 0.12);
    color: rgb(var(--v-theme-primary));
}

.btn--primary:hover {
    background: rgba(var(--v-theme-primary), 0.2);
}

.btn .mdi {
    font-size: 18px;
}

/* Integration list */
.integration-list {
    list-style: none;
    margin: 0;
    padding: 0 12px;
    margin-bottom: 24px;
}

.integration-item {
    margin-bottom: 8px;
}

.integration-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    background: rgba(var(--v-border-color), 0.06);
    min-height: 62px;
    cursor: pointer;
    transition: background 0.1s;
    width: 100%;
}

.integration-link--btn {
    border: none;
    font-family: inherit;
    font-size: inherit;
    text-align: left;
}

.integration-link:hover {
    background: rgba(var(--v-border-color), 0.1);
}

.integration-link__icon {
    font-size: 18px;
    flex-shrink: 0;
    opacity: 0.7;
}

.integration-link__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.integration-link__title {
    font-weight: 700;
    font-size: 0.9375rem;
}

.integration-link__title--danger {
    color: rgb(var(--v-theme-error));
}

.integration-link__status {
    font-size: 0.75rem;
    color: rgba(var(--v-theme-on-surface), 0.5);
}

.integration-link__status--success {
    color: rgb(var(--v-theme-success));
}

.integration-link__chevron {
    font-size: 18px;
    opacity: 0.5;
}
</style>
