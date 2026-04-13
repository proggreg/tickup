<script setup lang="ts">
import type { Endpoints } from '@octokit/types';
import { Button, Popover } from '@vuetify/v0';

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
const linkDialogEl = ref<HTMLDialogElement | null>(null);

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

watch(showLinkDialog, (val) => {
    if (!linkDialogEl.value) return;
    if (val) { linkDialogEl.value.showModal(); }
    else { linkDialogEl.value.close(); }
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
    <Popover.Root :close-on-content-click="false">
        <Popover.Activator>
            <Button.Root class="icon-btn">
                <Button.Icon>
                    <i class="mdi mdi-github" />
                </Button.Icon>
            </Button.Root>
        </Popover.Activator>
        <Popover.Content>
            <div class="github-menu">
                <div class="github-menu-item">
                    <div class="github-command-field">
                        <span class="github-command-text">{{ githubBranchCommand }}</span>
                        <div class="github-command-actions">
                            <GithubBranchCopy />
                            <GithubBranchOpen />
                            <GithubBranchOpenInIde />
                            <GithubBranchCreate />
                        </div>
                    </div>
                </div>
                <div class="github-menu-item">
                    <div class="github-menu-row">
                        <div class="github-repo-col">
                            <GithubRepoSelect />
                        </div>
                        <div class="github-branch-col">
                            <GithubBranchSelect :branch-name="githubBranchName" />
                        </div>
                    </div>
                </div>
            </div>
        </Popover.Content>
    </Popover.Root>

    <!-- Confirmation dialog for existing branch -->
    <Teleport to="body">
        <dialog
            ref="linkDialogEl"
            class="link-dialog"
            @close="showLinkDialog = false"
            @click.self="cancelLinkBranch"
        >
            <div class="link-dialog__content">
                <h3 class="link-dialog__title">Branch Already Exists</h3>
                <p class="link-dialog__text">
                    The branch <strong>{{ githubBranchName }}</strong> already exists in this repository.
                    Would you like to link this todo to the existing branch?
                </p>
                <div class="link-dialog__actions">
                    <Button.Root
                        class="btn"
                        @click="cancelLinkBranch"
                    >
                        Cancel
                    </Button.Root>
                    <Button.Root
                        class="btn btn--primary"
                        @click="confirmLinkBranch"
                    >
                        Link Branch
                    </Button.Root>
                </div>
            </div>
        </dialog>
    </Teleport>
</template>

<style scoped>
.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
    transition: background 0.15s;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn .mdi {
    font-size: 22px;
}

.github-menu {
    padding: 6px 8px;
    min-width: 420px;
    overflow: visible;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.github-menu-item {
    padding: 4px 0;
    overflow: visible;
}

.github-command-field {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 8px;
    gap: 6px;
    min-height: 36px;
}

.github-command-text {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: monospace;
    color: rgba(var(--v-theme-on-surface), 0.8);
}

.github-command-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
}

.github-menu-row {
    display: flex;
    gap: 8px;
}

.github-repo-col {
    flex: 0 0 41.66%;
    min-width: 0;
}

.github-branch-col {
    flex: 1;
    min-width: 160px;
}

/* Confirmation dialog */
.link-dialog {
    border: none;
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    padding: 0;
    max-width: 400px;
    width: calc(100vw - 48px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.link-dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
}

.link-dialog__content {
    padding: 24px;
}

.link-dialog__title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 12px;
}

.link-dialog__text {
    font-size: 0.9375rem;
    color: rgba(var(--v-theme-on-surface), 0.8);
    margin: 0 0 20px;
    line-height: 1.5;
}

.link-dialog__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
}

.btn {
    display: inline-flex;
    align-items: center;
    padding: 7px 16px;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    background: rgba(var(--v-border-color), 0.1);
    color: inherit;
    transition: background 0.15s;
}

.btn:hover {
    background: rgba(var(--v-border-color), 0.18);
}

.btn--primary {
    background: rgba(var(--v-theme-primary), 0.12);
    color: rgb(var(--v-theme-primary));
}

.btn--primary:hover {
    background: rgba(var(--v-theme-primary), 0.2);
}
</style>
