<script setup lang="ts">
const { todo } = defineProps<{ todo: Todo }>();
const listStore = useListsStore();
const { notify } = useNotification();
const repo = useState('githubRepo', () => null);
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
const hasBranch = useState('hasBranch', () => false);
const showLinkDialog = ref(false);
const pendingBranchResponse = ref(null);

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
    try {
        const response = await $fetch('/api/github', {
            method: 'POST',
            body: {
                branchName: githubBranchName.value,
                repo: repo.value,
            },
        });

        if (response.ref) {
            if (response.alreadyExists) {
                // Show confirmation dialog
                pendingBranchResponse.value = response;
                showLinkDialog.value = true;
            }
            else {
                updateTodo(response.url);
                notify('Branch created successfully');
            }
        }
    }
    catch (error: any) {
        console.error('Failed to create branch:', error);
        const errorMessage = error?.data?.message || error?.message || 'Failed to create branch';
        notify(errorMessage);

        // If it's an auth error, suggest reconnecting
        if (error?.status === 401 || error?.statusCode === 401) {
            notify('Please reconnect GitHub in Settings');
        }
    }
}

function confirmLinkBranch() {
    if (pendingBranchResponse.value) {
        updateTodo(pendingBranchResponse.value.url);
        notify('Branch linked successfully');
        showLinkDialog.value = false;
        pendingBranchResponse.value = null;
    }
}

function cancelLinkBranch() {
    showLinkDialog.value = false;
    pendingBranchResponse.value = null;
}

function updateTodo(url?: string) {
    listStore.currentTodo.githubBranchName = githubBranchName.value;
    listStore.currentTodo.githubRepo = repo.value?.full_name;

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
                >
                    <template #append>
                        <v-btn
                            size="small"
                            icon="mdi-content-copy"
                            @click.stop="copyToClipBoard"
                        />
                        <v-btn
                            v-if="!todo.githubLink"
                            icon="mdi-plus"
                            size="small"
                            variant="tonal"
                            color="green"
                            width="30"
                            height="30"
                            :disabled="!repo || hasBranch"
                            @click="createBranch"
                        />
                        <v-btn
                            v-if="todo.githubLink"
                            size="small"
                            icon="mdi-open-in-new"
                            :href="todo.githubLink"
                            target="_blank"
                        />
                    </template>
                </v-text-field>
            </v-list-item>
            <v-list-item>
                <v-row>
                    <v-col
                        cols="12"
                        class="pt-6"
                    >
                        <GithubRepoSelect
                            v-model="repo"
                        />
                    </v-col>
                    <v-col
                        cols="12"
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
