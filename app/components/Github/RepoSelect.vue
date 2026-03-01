<script setup lang="ts">
const listStore = useListsStore();
interface Repo {
    id: number;
    name: string;
    full_name?: string;
    private?: boolean;
    html_url?: string;
    description?: string | null;
    language?: string | null;
    default_branch?: string;
    updated_at?: string;
}

const liststore = useListsStore();
const selectedRepo = useState('githubRepo', () => null);
const repos = ref<Repo[]>([]);
const loading = ref(false);
const error = ref('');
const repoSelectInput = ref();
const menuOpen = ref(false);
const emit = defineEmits(['updateRepo']);

async function loadRepos() {
    loading.value = true;
    error.value = '';
    try {
        const data = await $fetch('/api/github/repos');
        repos.value = data.repositories;
    }
    catch (e: any) {
        error.value = e?.data?.message || 'Failed to load repositories';
    }
    loading.value = false;
}

function handleRepoUpdate(value: Repo | null) {
    selectedRepo.value = value;
    listStore.currentList.githubRepo = value.name;
    emit('updateRepo');
    if (value) {
        menuOpen.value = false;
        nextTick(() => {
            if (repoSelectInput.value) {
                const input = repoSelectInput.value.$el?.querySelector('input');
                if (input) {
                    input.blur();
                }
            }
        });
    }
}

function handleMenuUpdate(isOpen: boolean) {
    menuOpen.value = isOpen;
    if (!isOpen && selectedRepo.value) {
        nextTick(() => {
            if (repoSelectInput.value) {
                const input = repoSelectInput.value.$el?.querySelector('input');
                if (input) {
                    input.blur();
                }
            }
        });
    }
}

onBeforeMount(async () => {
    await loadRepos();
    if (!listStore.currentList.githubRepo) return;
    selectedRepo.value = repos.value.find(repo => repo?.name === listStore.currentList.githubRepo);
});
onUnmounted(() => {
    selectedRepo.value = null;
});

watch(() => liststore.currentList.githubRepo, (repo) => {
    const listsDefaultRepo = repos.value.find(r => r.name === repo);
    if (listsDefaultRepo) {
        selectedRepo.value = listsDefaultRepo;
    }
});
</script>

<template>
    <v-chip
        v-if="listStore.currentTodo.githubRepo && listStore.currentTodo.githubLink"
    >
        <v-icon icon="mdi-source-repository" />   {{ listStore.currentTodo.githubRepo }}
    </v-chip>
    <v-autocomplete
        v-else
        ref="repoSelectInput"
        :model-value="selectedRepo"
        :menu="menuOpen"
        :items="repos"
        :loading="loading"
        item-value="id"
        item-title="name"
        return-object
        label="Repository"
        placeholder="Select a repository"
        variant="outlined"
        density="compact"
        hide-details
        no-data-text="No repositories found"
        :error-messages="error"
        @update:model-value="handleRepoUpdate"
        @update:menu="handleMenuUpdate"
    >
        <template #item="{ props, item }">
            <v-list-item
                v-bind="props"
                :subtitle="item.raw.description"
                slim
            >
                <template #prepend>
                    <v-icon size="small">
                        {{ item.raw.private ? 'mdi-lock' : 'mdi-source-repository' }}
                    </v-icon>
                </template>
            </v-list-item>
        </template>
    </v-autocomplete>
</template>
