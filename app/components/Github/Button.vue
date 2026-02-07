<script setup lang="ts">
import type { Endpoints } from '@octokit/types';

const { notify } = useNotification();
const listStore = useListsStore();

const { todo } = defineProps<{ todo: Todo }>();
const githubBranchCommand = useState('githubBranchCommand');
const showLinkDialog = useState('showLinkDialog', () => null);
const selectedRepo = useState<Endpoints['GET /repos/{owner}/{repo}']['response']['data']>('githubRepo', () => null);
const githubBranchName = useState('githubBranchName', () => {
    return computed(() => {
        if (todo?.githubBranchName) {
            return todo.githubBranchName;
        }
        let branchName = filteredTodoName.value.replace(/[!@#$%^&*(),.?":{}|<>]/g, '').replace(/ /g, '-').toLowerCase();
        if (branchName.charAt(branchName.length - 1) === '-') {
            branchName = branchName.slice(0, -1);
        }
        return branchName;
    });
});
const pendingBranchResponse = useState('pendingBranchResponse', () => null);

const filteredTodoName = computed(() => todo.name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2B00}-\u{2BFF}]/gu, '').trim());

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
    >
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                icon="mdi-github"
            />
        </template>
        <v-list>
            <v-list-item>
                <v-text-field
                    :model-value="githubBranchCommand"
                    class="font-weight-bold"
                    variant="outlined"
                    readonly
                    hide-details
                    center-affix
                    min-width="300px"
                >
                    <template #append>
                        <GithubBranchCopy />
                        <GithubBranchCreate />
                        <GithubBranchOpen />
                    </template>
                </v-text-field>
            </v-list-item>
            <v-list-item>
                <v-row>
                    <v-col
                        cols="6"
                    >
                        <GithubRepoSelect />
                    </v-col>
                    <v-col
                        cols="6"
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
