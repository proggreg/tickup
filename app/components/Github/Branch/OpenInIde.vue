<script setup lang="ts">
import { Button, Popover } from '@vuetify/v0';
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
        ideUrl = `x-github-client://openRepo/${repoUrl}`;
        if (branchName) {
            ideUrl += `?branch=${branchName}`;
        }
    }
    else {
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
    <Popover.Root>
        <Popover.Activator>
            <Button.Root
                class="icon-btn"
                aria-label="Open in IDE"
                :disabled="!selectedRepo"
            >
                <Button.Icon>
                    <i class="mdi mdi-laptop" />
                </Button.Icon>
            </Button.Root>
        </Popover.Activator>
        <Popover.Content class="menu-content">
            <p class="menu-subheader">
                Open in IDE
            </p>
            <ul class="menu-list">
                <li
                    v-for="ide in ides"
                    :key="ide.name"
                    class="menu-item"
                    @click="openInIDE(ide)"
                >
                    <i :class="`mdi ${ide.icon} menu-item__icon`" />
                    <span>{{ ide.name }}</span>
                </li>
            </ul>
        </Popover.Content>
    </Popover.Root>
</template>

<style scoped>
.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    color: inherit;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.icon-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.icon-btn .mdi {
    font-size: 16px;
}

.menu-content {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-border-color), 0.12);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 4px;
    min-width: 180px;
    z-index: 100;
}

.menu-subheader {
    padding: 4px 12px 2px;
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    font-size: 0.875rem;
    cursor: pointer;
    border-radius: 4px;
    color: rgb(var(--v-theme-on-surface));
}

.menu-item:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.menu-item__icon {
    font-size: 18px;
    width: 20px;
}
</style>
