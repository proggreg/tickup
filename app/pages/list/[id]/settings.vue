<script setup lang="ts">
const route = useRoute();
const listId = computed(() => route.params.id);
const listsStore = useListsStore();
const selectedRepo = useState('githubRepo', () => listsStore.currentList.githubRepo);
const defaultViewOptions = ref<View[]>(['list', 'board']);
const selectedDefaultView = ref<View | null>(null);

const onDefaultViewChange = async (value: View | null) => {
    // Keep store in sync with the local selection
    listsStore.currentList.defaultView = value ?? undefined;
    // Persist the new default view immediately when the user selects/clears it
    await listsStore.updateList();
};

onBeforeMount(async () => {
    await listsStore.getList(route.params.id);

    // Initialize local selected value from the loaded list
    if (listsStore.currentList.defaultView && defaultViewOptions.value.includes(listsStore.currentList.defaultView)) {
        selectedDefaultView.value = listsStore.currentList.defaultView;
    }
});

watch(selectedRepo, () => {
    if (selectedRepo.value?.name) {
        listsStore.currentList.githubRepo = selectedRepo.value?.name;
    }
});

const removeRepo = () => {
    listsStore.currentList.githubRepo = '';
};

const updateList = async () => {
    // Persist current list settings (including defaultView and githubRepo)
    await listsStore.updateList();
};
</script>

<template>
    <v-container fluid>
        <v-row no-gutters>
            <v-col cols="auto">
                <v-btn
                    :to="`/list/${listId}`"
                    variant="text"
                    prepend-icon="mdi-arrow-left"
                    class="mb-6"
                />
            </v-col>
            <v-col cols="auto">
                <h1 class="text-capitalize font-weight-bold">
                    {{ listsStore.currentList.name }} Settings
                </h1>
            </v-col>
        </v-row>

        <v-row>
            <!-- GitHub integration / default repo column -->
            <SettingsColumn
                test-id="list-settings-github-column"
                icon="mdi-github"
                title="GitHub Integration"
                description="Default GitHub repository"
            >
                <v-row>
                    <v-col
                        cols="12"
                        md="8"
                    >
                        <GithubRepoSelect @update-repo="updateList" />
                    </v-col>
                </v-row>
            </SettingsColumn>

            <!-- Default view column -->
            <SettingsColumn
                test-id="list-settings-default-view-column"
                icon="mdi-view-dashboard-outline"
                title="Default View"
                description="Choose whether this list opens in board or list view by default."
            >
                <v-select
                    v-model="selectedDefaultView"
                    :items="defaultViewOptions"
                    label="Default view"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details
                    data-testid="list-default-view-select"
                    @update:model-value="onDefaultViewChange"
                />
            </SettingsColumn>

            <!-- Future settings columns can be added here using <SettingsColumn> -->
        </v-row>
    </v-container>
</template>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
</style>
