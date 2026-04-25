<script setup lang="ts">
import { Button } from '@vuetify/v0';
import type { Endpoints } from '@octokit/types';

const githubBranchName = useState<string>('githubBranchName');
const selectedRepo = useState<Endpoints['GET /repos/{owner}/{repo}']['response']['data']>('githubRepo');
const { notify } = useNotification();
const listStore = useListsStore();

const githubBranchCommand = computed(() => {
    if (listStore.currentTodo.githubBranchName) {
        return `git checkout "${githubBranchName.value}"`;
    }
    return `git checkout -b "${githubBranchName.value}"`;
});

const copyToClipBoard = () => {
    if (githubBranchName.value) {
        navigator.clipboard.writeText(githubBranchCommand.value);
        notify('Copied to clipboard');

        if (!listStore.currentTodo.githubBranchName) {
            listStore.currentTodo.githubBranchName = githubBranchName.value as string;
            listStore.currentTodo.githubRepo = selectedRepo.value?.full_name;

            listStore.updateTodo(listStore.currentTodo);
        }
    }
};
</script>

<template>
    <Button.Root
        class="icon-btn"
        aria-label="Copy to clipboard"
        @click.stop="copyToClipBoard"
    >
        <Button.Icon>
            <i class="mdi mdi-content-copy" />
        </Button.Icon>
    </Button.Root>
</template>

<style scoped>
.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: rgba(var(--v-theme-on-surface), 0.55);
    padding: 0;
    flex-shrink: 0;
    transition: background 0.12s, color 0.12s;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.11);
}

.icon-btn .mdi {
    font-size: 15px;
}
</style>
