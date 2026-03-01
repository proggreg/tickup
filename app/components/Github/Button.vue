<script setup lang="ts">
import type { Endpoints } from '@octokit/types';

const { notify } = useNotification();
const listStore = useListsStore();

const { todo } = defineProps<{ todo: Todo }>();
const githubBranchName = useState<string>('githubBranchName', () => '');
const githubBranchCommand = computed(() => {
    if (listStore.currentTodo.githubBranchName) {
        return `git checkout "${githubBranchName.value}"`;
    }
    return `git checkout -b "${githubBranchName.value}"`;
});
const showLinkDialog = useState('showLinkDialog', () => null);
const selectedRepo = useState<Endpoints['GET /repos/{owner}/{repo}']['response']['data']>('githubRepo', () => null);
const pendingBranchResponse = useState('pendingBranchResponse', () => null);

const filteredTodoName = computed(() => todo.name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2B00}-\u{2BFF}]/gu, '').trim());

watchEffect(() => {
    if (todo?.githubBranchName) {
        githubBranchName.value = todo.githubBranchName;
        return;
    }

    let branchName = filteredTodoName.value
        .replace(/[!@#$%^&*(),.?":{}|<>]/g, '')
        .replace(/ /g, '-')
        .toLowerCase();

    if (branchName.endsWith('-')) {
        branchName = branchName.slice(0, -1);
    }

    githubBranchName.value = branchName;
});

function confirmLinkBranch() {
    if (pendingBranchResponse.value) {
        updateTodoWithGithub(pendingBranchResponse.value.url);
        notify('Branch linked successfully');
        showLinkDialog.value = false;
        pendingBranchResponse.value = null;
    }
}

function cancelLinkBranch() {
    showLinkDialog.value = false;
    pendingBranchResponse.value = null;
}

function updateTodoWithGithub(url?: string) {
    listStore.currentTodo.githubBranchName = githubBranchName.value;
    listStore.currentTodo.githubRepo = selectedRepo.value?.full_name;

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
        :close-on-content-click="false"
        elevation="0"
    >
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                icon="mdi-github"
            />
        </template>
        <v-list
            class="github-menu rounded-xl"
            density="compact"
            elevation="1"
        >
            <v-list-item
                class="github-menu-item"
                slim
            >
                <v-text-field
                    :model-value="githubBranchCommand"
                    class="github-command-field font-weight-bold"
                    variant="outlined"
                    single-line
                    density="compact"
                    readonly
                    hide-details
                    center-affix
                >
                    <template #append-inner>
                        <GithubBranchCopy />
                        <GithubBranchOpen />
                        <GithubBranchOpenInIde />
                        <GithubBranchCreate />
                    </template>
                </v-text-field>
            </v-list-item>
            <v-list-item
                class="github-menu-item"
                slim
            >
                <v-row
                    class="github-menu-row"
                    dense
                >
                    <v-col
                        cols="5"
                        class="pa-0 pr-1 github-repo-col"
                    >
                        <GithubRepoSelect />
                    </v-col>
                    <v-col
                        cols="7"
                        class="pa-0 pl-1 github-branch-col"
                    >
                        <GithubBranchSelect :branch-name="githubBranchName" />
                    </v-col>
                </v-row>
            </v-list-item>
        </v-list>
    </v-menu>

    <!-- Confirmation dialog for existing branch -->
    <v-dialog
        v-model="showLinkDialog"
        max-width="400"
    >
        <v-card>
            <v-card-title class="text-h6">
                Branch Already Exists
            </v-card-title>
            <v-card-text>
                The branch <strong>{{ githubBranchName }}</strong> already exists in this repository.
                Would you like to link this todo to the existing branch?
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn
                    text="Cancel"
                    @click="cancelLinkBranch"
                />
                <v-btn
                    color="primary"
                    text="Link Branch"
                    @click="confirmLinkBranch"
                />
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.github-menu {
    padding: 6px 8px;
    min-width: 420px;
    overflow: visible;
}

.github-branch-col {
    min-width: 0;
}

.github-branch-col :deep(.v-autocomplete .v-field),
.github-branch-col :deep(.v-chip) {
    min-width: 160px;
}

.github-menu-item {
    padding: 4px 0;
    overflow: visible;
}

.github-menu-item :deep(.v-list-item__content) {
    padding: 0;
    overflow: visible;
    min-width: 0;
}

.github-command-field :deep(.v-field__input) {
    display: flex;
    align-items: center;
}

.github-command-field :deep(.v-field__input input) {
    font-size: 14px;
}

.github-command-field :deep(.v-field) {
    --v-field-padding-top: 4px;
    --v-field-padding-bottom: 8px;
    --v-field-padding-start: 10px;
    --v-field-padding-end: 6px;
}

.github-menu-row {
    margin: 0;
}
</style>
