<script setup lang="ts">
const { todo } = defineProps<{ todo: Todo }>();
const listStore = useListsStore();
const { notify } = useNotification();
const repo = ref();

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
        updateTodo(response);
        notify('Branch created successfully');
    }
}

function updateTodo(response?) {
    listStore.currentTodo.githubBranchName = githubBranchName.value;
    listStore.currentTodo.githubRepo = repo.value.full_name;

    if (response) {
        listStore.currentTodo.githubLink = response.url;
    }

    listStore.updateTodo(listStore.currentTodo);
}

watch(repo, async () => {
    console.log('repo changed', repo);

    try {
        const branch = await $fetch('/api/github/branch', {
            query: {
                branch: githubBranchName.value,
                repo: repo.value.name,
                owner: repo.value.full_name.split('/').shift(),
            },
        });

        if (branch) {
            const url = branch._links.html;
            if (url) {
                updateTodo({
                    url,
                });
            }
            console.log('url', url);
        }
    }
    catch { /* empty */ }
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
                    append-icon="mdi-content-copy"
                    variant="outlined"
                    @click:append.stop="copyToClipBoard"
                >
                    {{ githubBranchCommand }}
                </v-text-field>
            </v-list-item>
            <v-list-item>
                {{ todo.githubRepo }}

                <GithubRepoSelect
                    v-if="!todo.githubRepo"
                    v-model="repo"
                />
            </v-list-item>
            <v-list-item>
                <v-btn
                    v-if="!todo.githubBranchName"
                    color="primary"
                    variant="tonal"
                    :disabled="!repo"
                    @click.stop="createBranch"
                >
                    Create Branch
                </v-btn>
                <v-btn
                    v-else-if="todo.githubLink"
                    class="font-weight-bold"
                    :href="todo.githubLink"
                    target="_blank"
                >
                    View Branch
                </v-btn>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
