<script setup lang="ts">
import type { Endpoints } from '@octokit/types';

const { todo } = defineProps<{ todo: Todo }>();
const listStore = useListsStore();
const { notify } = useNotification();
const repo = useState('githubRepo', () => null);
const selectedBranch = ref();
const selectedRepo = useState('githubRepo', () => null);
const filteredTodoName = computed(() => todo.name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2B00}-\u{2BFF}]/gu, '').trim());
const githubBranchName = computed(() => {
    if (todo?.githubBranchName) {
        return todo.githubBranchName;
    }
    let branchName = filteredTodoName.value.replace(/[!@#$%^&*(),.?":{}|<>]/g, '').replace(/ /g, '-').toLowerCase();
    if (branchName.charAt(branchName.length - 1) === '-') {
        branchName = branchName.slice(0, -1);
    }
    return branchName;
});

const githubBranchCommand = computed(() => {
    if (todo.githubBranchName) {
        return `git checkout "${todo.githubBranchName}"`;
    }
    return `git checkout -b "${githubBranchName.value}"`;
});

const copyToClipBoard = () => {
    if (githubBranchName.value) {
        navigator.clipboard.writeText(githubBranchCommand.value);
        notify('Copied to clipboard');
        if (!listStore.currentTodo.githubBranchName) {
            updateTodo();
        }
    }
};

async function createBranch() {
    const response = await $fetch('/api/github', {
        method: 'POST',
        body: {
            branchName: githubBranchName.value,
            repo: repo.value,
        },
    });

    if (response.ref) {
        updateTodo(response.url);
        notify('Branch created successfully');
    }
}

function updateTodo(url?: string) {
    listStore.currentTodo.githubBranchName = githubBranchName.value;
    listStore.currentTodo.githubRepo = repo.value.full_name;

    if (url) {
        listStore.currentTodo.githubLink = url;
    }

    listStore.updateTodo(listStore.currentTodo);
}

onUnmounted(() => {
    selectedRepo.value = null;
});
</script>

<template>
    <v-menu
        class="pa-4"
        min-width="300px"
        :close-on-content-click="false"
    >
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                icon="mdi-github"
            />
        </template>
        <v-list>
            <v-list-item class="d-flex">
                <v-text-field
                    class="font-weight-bold"
                    variant="outlined"
                    readonly
                >
                    <template #append>
                        <v-btn
                            icon="mdi-content-copy"
                            @click.stop="copyToClipBoard"
                        />
                        <v-btn
                            v-if="!todo.githubLink"
                            icon="mdi-plus"
                            variant="tonal"
                            color="green"
                            width="30"
                            height="30"
                            :disabled="!repo"
                            @click="createBranch"
                        />
                        <v-btn
                            v-if="todo.githubLink"
                            icon="mdi-open-in-new"
                            :href="todo.githubLink"
                            target="_blank"
                        />
                    </template>
                    {{ githubBranchCommand }}
                </v-text-field>
            </v-list-item>
            <v-list-item>
                <v-row>
                    <v-col>
                        <GithubRepoSelect
                            v-model="repo"
                        />
                    </v-col>
                    <v-col>
                        <GithubBranchSelect
                            v-model="selectedBranch"
                        />
                    </v-col>
                </v-row>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
