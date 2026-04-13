<script setup lang="ts">
import { Button, Select } from '@vuetify/v0';
import type { Repo } from '~/components/Github/RepoSelect.vue';

const route = useRoute();
const listId = computed(() => route.params.id);
const listsStore = useListsStore();
const selectedRepo = useState<Repo>('githubRepo', () => null);
const defaultViewOptions = ref<View[]>(['list', 'board']);
const selectedDefaultView = ref<View | null>(null);

const onDefaultViewChange = async (value: View | null) => {
    listsStore.currentList.defaultView = value ?? undefined;
    await listsStore.updateList();
};

onBeforeMount(async () => {
    await listsStore.getList(route.params.id as string);

    if (listsStore.currentList.defaultView && defaultViewOptions.value.includes(listsStore.currentList.defaultView)) {
        selectedDefaultView.value = listsStore.currentList.defaultView;
    }
});

watch(selectedRepo, () => {
    if (selectedRepo.value?.name) {
        listsStore.currentList.githubRepo = selectedRepo.value?.name;
    }
});

const updateList = async () => {
    await listsStore.updateList();
};
</script>

<template>
    <div class="list-settings-page">
        <div class="list-settings-page__header">
            <Button.Root
                class="back-btn"
                :to="`/list/${listId}`"
            >
                <Button.Icon>
                    <i class="mdi mdi-arrow-left" />
                </Button.Icon>
            </Button.Root>
            <h1 class="list-settings-page__title">
                {{ listsStore.currentList.name }} Settings
            </h1>
        </div>

        <div class="settings-columns">
            <!-- GitHub integration / default repo column -->
            <SettingsColumn
                test-id="list-settings-github-column"
                icon="mdi-github"
                title="GitHub Integration"
                description="Default GitHub repository"
            >
                <div class="settings-field">
                    <GithubRepoSelect @update-repo="updateList" />
                </div>
            </SettingsColumn>

            <!-- Default view column -->
            <SettingsColumn
                test-id="list-settings-default-view-column"
                icon="mdi-view-dashboard-outline"
                title="Default View"
                description="Choose whether this list opens in board or list view by default."
            >
                <Select.Root
                    v-model="selectedDefaultView"
                    data-testid="list-default-view-select"
                    @update:model-value="onDefaultViewChange"
                >
                    <Select.Activator>
                        <button class="view-select-trigger">
                            <Select.Value placeholder="Default view" />
                            <i class="mdi mdi-chevron-down" />
                        </button>
                    </Select.Activator>
                    <Select.Content>
                        <Select.Item
                            value=""
                            class="select-item"
                        >
                            <span>None</span>
                        </Select.Item>
                        <Select.Item
                            v-for="option in defaultViewOptions"
                            :key="option"
                            :value="option"
                            class="select-item"
                        >
                            <span>{{ option }}</span>
                            <Select.ItemIndicator>
                                <i class="mdi mdi-check" />
                            </Select.ItemIndicator>
                        </Select.Item>
                    </Select.Content>
                </Select.Root>
            </SettingsColumn>
        </div>
    </div>
</template>

<style scoped>
.list-settings-page {
    padding: 24px;
}

.list-settings-page__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
}

.back-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
    transition: background 0.1s;
}

.back-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.back-btn .mdi {
    font-size: 22px;
}

.list-settings-page__title {
    font-size: 1.25rem;
    font-weight: 700;
    text-transform: capitalize;
    margin: 0;
}

.settings-columns {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -8px;
}

.settings-field {
    width: 100%;
    max-width: 320px;
}

.view-select-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 6px;
    background: transparent;
    color: inherit;
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    min-width: 140px;
}

.view-select-trigger:hover {
    border-color: rgba(var(--v-border-color), 0.6);
}

.view-select-trigger .mdi {
    font-size: 16px;
    opacity: 0.6;
    margin-left: auto;
}

.select-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 0.875rem;
    border-radius: 4px;
    transition: background 0.1s;
    text-transform: capitalize;
}

.select-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}
</style>
