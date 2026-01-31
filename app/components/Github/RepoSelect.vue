<script setup lang="ts">
interface Repo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string | null;
    language: string | null;
    default_branch: string;
    updated_at: string;
}

const selectedRepo = defineModel<Repo | null>({ default: null });

const repos = ref<Repo[]>([]);
const loading = ref(false);
const error = ref('');

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

onMounted(() => {
    loadRepos();
});
</script>

<template>
    <v-autocomplete
        v-model="selectedRepo"
        :items="repos"
        :loading="loading"
        item-value="id"
        item-title="full_name"
        return-object
        label="Repository"
        placeholder="Select a repository"
        variant="outlined"
        density="compact"
        hide-details
        no-data-text="No repositories found"
        :error-messages="error"
    >
        <template #item="{ props, item }">
            <v-list-item
                v-bind="props"
                :subtitle="item.raw.description"
            >
                <template #prepend>
                    <v-icon size="small">
                        {{ item.raw.private ? 'mdi-lock' : 'mdi-source-repository' }}
                    </v-icon>
                </template>
            </v-list-item>
        </template>

        <template #selection="{ item }">
            <div class="d-flex align-center ga-2">
                <v-icon size="small">
                    {{ item.raw.private ? 'mdi-lock' : 'mdi-source-repository' }}
                </v-icon>
                {{ item.raw.full_name }}
            </div>
        </template>
    </v-autocomplete>
</template>
