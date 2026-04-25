<script setup lang="ts">
import { Button } from '@vuetify/v0';

const listStore = useListsStore();
const selectedBranch = useState('githubBranch');

async function unlinkBranch() {
    selectedBranch.value = null;
    if (listStore.currentTodo.githubBranchName) {
        listStore.currentTodo.githubBranchName = null;
        listStore.currentTodo.githubLink = null;
        listStore.updateTodo();
    }
}
</script>

<template>
    <Button.Root
        class="icon-btn icon-btn--danger"
        aria-label="Unlink branch"
        @click="unlinkBranch"
    >
        <Button.Icon>
            <i class="mdi mdi-link-off" />
        </Button.Icon>
    </Button.Root>
</template>

<style scoped>
.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: rgba(var(--v-theme-on-surface), 0.55);
    padding: 0;
    flex-shrink: 0;
    transition: background 0.12s, color 0.12s;
}

.icon-btn--danger:hover {
    background: rgba(var(--v-theme-error), 0.07);
    color: rgb(var(--v-theme-error));
}

.icon-btn .mdi {
    font-size: 15px;
}
</style>
