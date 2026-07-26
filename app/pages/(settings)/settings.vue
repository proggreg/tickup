<script setup lang="ts">
definePageMeta({ layout: 'settings' });

const { mdAndUp } = useDisplay();
const store = useSettingsStore();

const route = useRoute();

const activeSection = ref('account');

const githubConnected = ref(false);
const githubLoading = ref(false);

async function checkGithubStatus() {
    githubLoading.value = true;
    try {
        const result = await $fetch('/api/github/check');
        githubConnected.value = !!result;
    } catch {
        githubConnected.value = false;
    }
    githubLoading.value = false;
}

await useAsyncData(() => store.getUserSettings().then(() => true));

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
    <!-- ── Desktop: two-column ── -->
    <v-row v-if="mdAndUp" class="settings-desktop full-height" no-gutters>
        <v-col cols="2">
            <SettingsNav :active-section="activeSection" @navigate="activeSection = $event" />
        </v-col>

        <v-col cols="10">
            <v-container>
                <v-row>
                    <v-col cols="12" class="text-capitalize">
                        <h1>{{ route.path.split('/').pop() }}</h1>
                    </v-col>
                    <v-col>
                        <NuxtPage />
                    </v-col>
                </v-row>
            </v-container>
        </v-col>

        <!-- <router-view></router-view> -->
    </v-row>

    <!-- ── Mobile: single column ── -->
    <div v-else class="settings-mobile">
        <h1 class="settings-mobile__title">Settings</h1>
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
