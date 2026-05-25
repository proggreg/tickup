<script setup lang="ts">
definePageMeta({ layout: 'settings' });

const { mdAndUp } = useDisplay();
const store = useSettingsStore();
const supabase = useSupabaseClient();
const router = useRouter();
const route = useRoute();
const { user } = useCurrentUser();

const activeSection = ref('account');

const githubConnected = ref(false);
const githubLoading = ref(false);

async function checkGithubStatus() {
    githubLoading.value = true;
    try {
        const result = await $fetch('/api/github/check');
        githubConnected.value = !!result;
    }
    catch {
        githubConnected.value = false;
    }
    githubLoading.value = false;
}

await useAsyncData(() => store.getUserSettings().then(() => true));

const savedStatuses = ref<Status[]>(store.userStatuses.map(s => ({ ...s })));

const isDirty = computed(() => {
    const curr = store.userStatuses;
    const saved = savedStatuses.value;
    if (curr.length !== saved.length) return true;
    return curr.some((s, i) => s.name !== saved[i]?.name || s.color !== saved[i]?.color);
});

const palette = [
    '#506076',
    '#005ac2',
    '#d23f7f',
    '#e8a92b',
    '#1a7a4a',
    '#ba1b24',
    '#7a3fb2',
    '#0096a5',
    '#b35b00',
    '#3c5b8a',
    '#5f7d4f',
    '#88607a',
];

function isLocked(index: number): 'start' | 'end' | false {
    if (index === 0) return 'start';
    if (index === store.userStatuses.length - 1) return 'end';
    return false;
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
    const color = palette[Math.floor(Math.random() * palette.length)];
    store.userStatuses.splice(insertAt, 0, { name: 'New status', color, Edit: false });
}

function updateStatusName(index: number, name: string) {
    store.userStatuses[index].name = name;
}

function updateStatusColor(index: number, color: string) {
    store.userStatuses[index].color = color;
}

function deleteStatus(index: number) {
    if (index > 0 && index < store.userStatuses.length - 1) {
        store.userStatuses.splice(index, 1);
    }
}

const isSaving = ref(false);

async function save() {
    isSaving.value = true;
    for (let i = store.userStatuses.length - 2; i >= 1; i--) {
        if (store.userStatuses[i].name === '') {
            store.userStatuses.splice(i, 1);
        }
    }
    await $fetch('/api/settings', {
        method: 'PUT',
        body: { statuses: store.userStatuses },
    });
    savedStatuses.value = store.userStatuses.map(s => ({ ...s }));
    isSaving.value = false;
}

function discard() {
    store.userStatuses.splice(
        0,
        store.userStatuses.length,
        ...savedStatuses.value.map(s => ({ ...s })),
    );
}

async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error(error);
        return;
    }
    router.push('/login');
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

const sectionMeta: Record<string, { title: string; description: string }> = {
    workflow: {
        title: 'Workflow statuses',
        description:
            'Define the states your tasks move through. The first and last are anchors — they can\'t be moved or deleted.',
    },
    integrations: {
        title: 'Integrations',
        description: 'Connect Tickup to the rest of your stack.',
    },
    account: {
        title: 'Account',
        description: 'Profile, password, and session.',
    },
};
</script>

<template>
    <!-- ── Desktop: two-column ── -->
    <div
        v-if="mdAndUp"
        class="settings-desktop"
    >
        <SettingsSettingsNav
            :active-section="activeSection"
            @navigate="activeSection = $event"
        />

        <main class="settings-desktop__main">
            <!-- Section header -->
            <div
                v-if="sectionMeta[activeSection]"
                class="section-header"
            >
                <h2 class="section-header__title">
                    {{ sectionMeta[activeSection].title }}
                </h2>
                <p class="section-header__desc">
                    {{ sectionMeta[activeSection].description }}
                </p>
            </div>

            <!-- Workflow -->
            <template v-if="activeSection === 'workflow'">
                <div class="settings-card">
                    <draggable
                        :list="store.userStatuses"
                        item-key="name"
                        handle=".drag-handle"
                        :move="canMove"
                    >
                        <template #item="{ element: status, index: i }">
                            <SettingsStatusRow
                                :status="status"
                                :index="i"
                                :total="store.userStatuses.length"
                                :locked="isLocked(i)"
                                @update:name="updateStatusName(i, $event)"
                                @update:color="updateStatusColor(i, $event)"
                                @delete="deleteStatus(i)"
                            />
                        </template>
                    </draggable>
                    <button
                        class="add-status-btn"
                        @click="addStatus"
                    >
                        <v-icon
                            icon="mdi-plus"
                            :size="16"
                        />
                        Add status
                    </button>
                </div>
                <div class="save-row">
                    <button
                        v-if="isDirty"
                        class="btn-discard"
                        @click="discard"
                    >
                        Discard
                    </button>
                    <button
                        class="btn-save"
                        :class="{ 'btn-save--clean': !isDirty }"
                        :disabled="!isDirty || isSaving"
                        @click="save"
                    >
                        Save changes
                    </button>
                </div>
            </template>

            <!-- Integrations -->
            <template v-else-if="activeSection === 'integrations'">
                <div class="settings-card">
                    <SettingsIntegrationRow
                        icon="mdi-github"
                        name="GitHub"
                        description="Connect repositories, issues, branches, and pull requests to your tasks."
                        :connected="githubConnected"
                        @click="$router.push('/settings/github')"
                    />
                </div>
            </template>

            <!-- Account -->
            <template v-else-if="activeSection === 'account'">
                <div class="settings-card">
                    <SettingsAccountRow
                        icon="mdi-account-outline"
                        label="Profile"
                        :value="user?.email"
                        action="Edit"
                        @click="() => {}"
                    />
                    <div class="card-divider" />
                    <SettingsAccountRow
                        icon="mdi-key-outline"
                        label="Password"
                        action="Change"
                        @click="() => {}"
                    />
                    <div class="card-divider" />
                    <SettingsAccountRow
                        icon="mdi-logout"
                        label="Sign out"
                        action-icon="mdi-arrow-right"
                        :danger="true"
                        @click="signOut"
                    />
                </div>
            </template>

            <!-- Appearance / Notifications placeholders -->
            <template v-else>
                <p class="coming-soon">
                    Coming soon
                </p>
            </template>
        </main>
    </div>

    <!-- ── Mobile: single column ── -->
    <div
        v-else
        class="settings-mobile"
    >
        <h1 class="settings-mobile__title">
            Settings
        </h1>

        <!-- Workflow -->
        <div class="mobile-section">
            <div class="mobile-section__label">
                Workflow
            </div>
            <div class="settings-card settings-card--mobile">
                <draggable
                    :list="store.userStatuses"
                    item-key="name"
                    handle=".drag-handle"
                    :move="canMove"
                >
                    <template #item="{ element: status, index: i }">
                        <SettingsStatusRow
                            :status="status"
                            :index="i"
                            :total="store.userStatuses.length"
                            :locked="isLocked(i)"
                            @update:name="updateStatusName(i, $event)"
                            @update:color="updateStatusColor(i, $event)"
                            @delete="deleteStatus(i)"
                        />
                    </template>
                </draggable>
                <div class="mobile-card-footer">
                    <button
                        class="mobile-add-btn"
                        @click="addStatus"
                    >
                        <v-icon
                            icon="mdi-plus"
                            :size="14"
                            color="var(--color-primary, #005ac2)"
                        />
                        Add status
                    </button>
                    <button
                        class="mobile-save-btn"
                        :class="{ 'mobile-save-btn--dirty': isDirty }"
                        :disabled="!isDirty || isSaving"
                        @click="save"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>

        <!-- Integrations -->
        <div class="mobile-section">
            <div class="mobile-section__label">
                Integrations
            </div>
            <div class="settings-card settings-card--mobile">
                <SettingsIntegrationRow
                    icon="mdi-github"
                    name="GitHub"
                    description="Connect repositories, issues, branches, and pull requests to your tasks."
                    short-description="Issues, branches, PRs"
                    :connected="githubConnected"
                    @click="$router.push('/settings/github')"
                />
            </div>
        </div>

        <!-- Account -->
        <div class="mobile-section">
            <div class="mobile-section__label">
                Account
            </div>
            <div class="settings-card settings-card--mobile">
                <SettingsAccountRow
                    icon="mdi-account-outline"
                    label="Profile"
                    :value="user?.email"
                    action="Edit"
                    @click="() => {}"
                />
                <div class="card-divider" />
                <SettingsAccountRow
                    icon="mdi-logout"
                    label="Sign out"
                    action-icon="mdi-arrow-right"
                    :danger="true"
                    @click="signOut"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ── Shared ── */
.settings-card {
    background: #ffffff;
    border-radius: 10px;
    box-shadow:
        0 1px 2px rgba(42, 52, 57, 0.04),
        0 0 0 1px rgba(113, 124, 130, 0.1);
    padding: 4px;
    overflow: hidden;
}
.settings-card--mobile {
    border-radius: 12px;
}
.card-divider {
    height: 1px;
    background: rgba(113, 124, 130, 0.16);
    margin-left: 52px;
}
.add-status-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    margin-top: 2px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-primary, #005ac2);
    transition: background 0.12s;
    text-align: left;
}
.add-status-btn:hover {
    background: rgba(113, 124, 130, 0.07);
}
.section-header {
    margin-bottom: 24px;
}
.section-header__title {
    font-family: 'Manrope', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #2a3439;
    margin: 0 0 4px;
}
.section-header__desc {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: rgba(42, 52, 57, 0.62);
    max-width: 520px;
    line-height: 1.5;
    margin: 0;
}
.coming-soon {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    color: rgba(42, 52, 57, 0.62);
}

/* ── Desktop ── */
.settings-desktop {
    display: flex;
    min-height: 100%;
    background: var(--color-background, #f7f9fb);
}
.settings-desktop__main {
    flex: 1;
    overflow-y: auto;
    padding: 36px 44px;
    background: var(--color-background, #f7f9fb);
}
.save-row {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
}
.btn-discard {
    padding: 8px 16px;
    border-radius: 7px;
    border: 1px solid rgba(113, 124, 130, 0.28);
    background: white;
    color: #2a3439;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.12s;
}
.btn-discard:hover {
    background: rgba(113, 124, 130, 0.07);
}
.btn-save {
    padding: 8px 20px;
    border-radius: 7px;
    border: none;
    background: var(--color-primary, #005ac2);
    color: white;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition:
        background 0.12s,
        color 0.12s;
}
.btn-save--clean,
.btn-save:disabled {
    background: var(--color-surface-low, #f0f4f7);
    color: rgba(42, 52, 57, 0.42);
    cursor: default;
}

/* ── Mobile ── */
.settings-mobile {
    padding: 24px 20px 80px;
    background: var(--color-background, #f7f9fb);
    min-height: 100%;
}
.settings-mobile__title {
    font-family: 'Manrope', sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: #2a3439;
    letter-spacing: -0.01em;
    margin: 0 0 24px;
}
.mobile-section {
    margin-bottom: 20px;
}
.mobile-section__label {
    font-family: 'Manrope', sans-serif;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgba(42, 52, 57, 0.62);
    padding: 0 4px 8px;
}
.mobile-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(113, 124, 130, 0.16);
    padding: 8px 12px;
}
.mobile-add-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
    background: transparent;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-primary, #005ac2);
    cursor: pointer;
    padding: 0;
}
.mobile-save-btn {
    padding: 6px 14px;
    border-radius: 7px;
    border: none;
    background: transparent;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: rgba(42, 52, 57, 0.42);
    cursor: default;
    transition:
        background 0.12s,
        color 0.12s;
}
.mobile-save-btn--dirty {
    background: var(--color-primary, #005ac2);
    color: white;
    cursor: pointer;
}
</style>
