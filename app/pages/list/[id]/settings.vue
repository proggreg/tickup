<script setup></script>

Here's the settings page using Vuetify components:
<script setup>
const route = useRoute();
const listId = computed(() => route.params.id);
const listsStore = useListsStore();
const selectedRepo = useState('githubRepo', () => listsStore.currentList.githubRepo);

onBeforeMount(async () => {
    await listsStore.getList(route.params.id);
});

watch(selectedRepo, () => {
    console.log('selectedRepo', selectedRepo);
    if (selectedRepo.value?.name) {
        listsStore.currentList.githubRepo = selectedRepo.value?.name;
    }
});

// Remove
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
    <v-container
        fluid
    >
        <v-row>
            <v-col
                cols="12"
            >
                <v-btn
                    :to="`/list/${listId}`"
                    variant="text"

                    prepend-icon="mdi-arrow-left"
                    class="mb-6"
                >
                    Back to List
                </v-btn>
            </v-col>
            <v-col
                cols="12"
                md="8"
                lg="6"
                class="mx-auto"
            >
                <!-- Back button -->

                <!-- Page title -->
                <h1 class="text-h3 font-weight-bold mb-8">
                    List Settings
                </h1>

                <!-- GitHub Repo Card -->
                <v-card class="mb-6">
                    <v-card-title class="d-flex align-center">
                        <v-icon
                            size="28"
                            class="mr-2"
                        >
                            mdi-github
                        </v-icon>
                        Default GitHub Repository {{ listsStore.currentList.githubRepo }}
                    </v-card-title>

                    <v-card-text>
                        <!-- Current Repo Display -->
                        <v-alert

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
                                    <div class="font-weight-medium" />
                                    <a

                                        target="_blank"
                                        class="text-primary text-decoration-none"
                                    >
                                        View on GitHub
                                        <v-icon size="14">mdi-open-in-new</v-icon>
                                    </a>
                                </div>
                            </div>
                        </v-alert>

                        <!-- Search Section -->
                        <div>
                            <v-row>
                                <v-col>
                                    <GithubRepoSelect />
                                </v-col>
                                <v-col cols="auto">
                                    <v-btn @click="updateList()">
                                        Save
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
