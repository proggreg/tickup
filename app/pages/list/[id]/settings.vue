<script setup lang="ts">
const route = useRoute();
const listId = computed(() => route.params.id);
const listsStore = useListsStore();
const selectedRepo = useState('githubRepo', () => listsStore.currentList.githubRepo);

onBeforeMount(async () => {
    await listsStore.getList(route.params.id);
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
    const list = await listsStore.getList(route.params.id);

    if (list) {
        listsStore.updateList(list);
    }
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
                <h1 class="text-h3 font-weight-bold ">
                    {{ listsStore.currentList.name }} Settings
                </h1>
            </v-col>
        </v-row>

        <!-- <v-row>
            <v-col cols="12">
                <h1 class="text-h3 font-weight-bold mb-8">
                    {{ listsStore.currentList.name }} Settings
                </h1>
            </v-col>
        </v-row> -->

        <v-row>
            <!-- GitHub integration / default repo column -->
            <SettingsColumn
                test-id="list-settings-github-column"
                icon="mdi-github"
                title="GitHub Integration"
                description="Default GitHub repository"
            >
                <v-alert
                    v-if="listsStore.currentList.githubRepo"
                    type="info"
                    variant="tonal"
                    class="mb-4"
                    closable
                    @click:close="removeRepo"
                >
                    <div class="d-flex align-center">
                        <v-icon
                            size="20"
                            class="mr-2"
                        >
                            mdi-github
                        </v-icon>
                        <div class="flex-grow-1">
                            <div class="font-weight-medium">
                                {{ listsStore.currentList.githubRepo }}
                            </div>
                        </div>
                    </div>
                </v-alert>

                <v-row>
                    <v-col
                        cols="12"
                        md="8"
                    >
                        <GithubRepoSelect />
                    </v-col>
                    <v-col
                        cols="12"
                        md="4"
                        class="d-flex align-end"
                    >
                        <v-btn
                            color="primary"
                            @click="updateList()"
                        >
                            Save
                        </v-btn>
                    </v-col>
                </v-row>
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
