<script setup lang="ts">
import type { Endpoints } from '@octokit/types';

const selectedRepo = useState<Endpoints['GET /repos/{owner}/{repo}']['response']['data']>('githubRepo');
const githubBranchName = useState('githubBranchName');
const { notify } = useNotification();
const listStore = useListsStore();

interface IDE {
    name: string;
    icon: string;
    urlScheme: string;
}

const ides: IDE[] = [
    { name: 'VS Code', icon: 'mdi-microsoft-visual-studio-code', urlScheme: 'vscode' },
    { name: 'Cursor', icon: 'mdi-cursor-default-outline', urlScheme: 'cursor' },
    { name: 'GitHub Desktop', icon: 'mdi-github', urlScheme: 'github-mac' },
];

function openInIDE(ide: IDE) {
    if (!selectedRepo.value) {
        notify('Please select a repository first');
        return;
    }

    const repoUrl = selectedRepo.value.html_url || `https://github.com/${selectedRepo.value.full_name}`;
    const branchName = listStore.currentTodo.githubBranchName || githubBranchName.value;

    let ideUrl = '';

    if (ide.urlScheme === 'github-mac') {
        // GitHub Desktop URL scheme
        ideUrl = `x-github-client://openRepo/${repoUrl}`;
        if (branchName) {
            ideUrl += `?branch=${branchName}`;
        }
    }
    else {
        // VS Code / Cursor URL scheme for cloning
        ideUrl = `${ide.urlScheme}://vscode.git/clone?url=${repoUrl}`;
        if (branchName) {
            ideUrl += `&ref=${branchName}`;
        }
    }

    try {
        window.location.href = ideUrl;
        notify(`Opening in ${ide.name}...`);
    }
    catch (error) {
        console.error('Failed to open in IDE:', error);
        notify('Failed to open in IDE. Make sure it is installed.');
    }
}
</script>

<template>
    <v-menu>
        <template #activator="{ props }">
            <v-btn
                v-bind="props"
                size="small"
                icon="mdi-laptop"
                :disabled="!selectedRepo"
            />
        </template>
        <v-list density="compact">
            <v-list-subheader>Open in IDE</v-list-subheader>
            <v-list-item
                v-for="ide in ides"
                :key="ide.name"
                @click="openInIDE(ide)"
            >
                <template #prepend>
                    <v-icon :icon="ide.icon" />
                </template>
                <v-list-item-title>{{ ide.name }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-menu>
</template>
