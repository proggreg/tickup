<script setup lang="ts">
import { Button, Input } from '@vuetify/v0';
import type { Meta } from '~/types/link.types';
import { logger } from '../../../utils/logger';

const listsStore = useListsStore();
const editLinks = ref([]);
async function removeLink(link) {
    const newLinks = listsStore.currentTodo.links.filter((l) => {
        return l.url !== link.url;
    });

    listsStore.currentTodo.links = newLinks;

    listsStore.updateTodo(listsStore.currentTodo);
}

async function fetchUrlsTitles(): Promise<Meta[]> {
    if (!listsStore.currentTodo.desc) return;
    const urlPattern = /(https?:\/\/[^\s]+)/g;

    const urls = listsStore.currentTodo.desc.match(urlPattern);

    if (urls) {
        return await $fetch('/api/metadata', { query: { urls: JSON.stringify(urls) } });
    }

    return [];
}

function editLink(link) {
    editLinks.value.push(link.url);
}

function cancelEditLink(link) {
    editLinks.value = editLinks.value.filter(url => url !== link.url);
}

watch(() => listsStore.currentTodo.desc, async () => {
    if (!listsStore.currentTodo.desc) return;
    try {
        const linkTitles = await fetchUrlsTitles();

        if (!linkTitles || !linkTitles.length) return;

        if (!listsStore.currentTodo.desc) return;

        for (const linkTitle of linkTitles) {
            if (!listsStore.currentTodo.links.find((l) => {
                return l.url === linkTitle.url;
            })) {
                listsStore.currentTodo.links.push(linkTitle);
            }
        }

        const urlPattern = /(https?:\/\/[^\s]+)/g;

        const urls = listsStore.currentTodo.desc.match(urlPattern);

        for (const url of urls) {
            listsStore.currentTodo.desc = listsStore.currentTodo.desc.replace(url, '');
        }
        listsStore.updateTodo(listsStore.currentTodo);
    }
    catch (e) {
        logger.error(e as Error, { component: 'TodoLinks', function: 'watchDesc' });
    }
});
</script>

<template>
    <div class="links-section">
        <div class="links-section__header">
            Links
        </div>
        <ul
            v-if="listsStore.currentTodo.links.length"
            class="links-list"
        >
            <li
                v-for="(link, index) in listsStore.currentTodo.links"
                :key="index"
                class="link-item"
            >
                <div class="link-item__content">
                    <a
                        v-if="!editLinks.includes(link.url)"
                        :href="link.url"
                        target="_blank"
                        class="link-item__anchor"
                    >{{ link.title }}</a>
                    <Input.Root
                        v-else
                        v-model="link.title"
                    >
                        <Input.Control
                            class="link-input"
                            @blur="listsStore.updateTodo()"
                        />
                    </Input.Root>
                </div>
                <div class="link-item__actions">
                    <Button.Root
                        v-if="!editLinks.includes(link.url)"
                        class="icon-btn"
                        aria-label="Edit link"
                        @click="editLink(link)"
                    >
                        <Button.Icon>
                            <i class="mdi mdi-pencil" />
                        </Button.Icon>
                    </Button.Root>
                    <Button.Root
                        v-else
                        class="icon-btn"
                        aria-label="Cancel edit"
                        @click="cancelEditLink(link)"
                    >
                        <Button.Icon>
                            <i class="mdi mdi-cancel" />
                        </Button.Icon>
                    </Button.Root>
                    <Button.Root
                        class="icon-btn icon-btn--danger"
                        aria-label="Remove link"
                        @click="removeLink(link)"
                    >
                        <Button.Icon>
                            <i class="mdi mdi-delete" />
                        </Button.Icon>
                    </Button.Root>
                </div>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.links-section__header {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(var(--v-theme-on-surface), 0.55);
    margin-bottom: 8px;
    padding: 4px 0;
}

.links-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.link-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
    gap: 8px;
}

.link-item:last-child {
    border-bottom: none;
}

.link-item__content {
    flex: 1;
    min-width: 0;
}

.link-item__anchor {
    font-size: 0.875rem;
    color: rgb(var(--v-theme-primary));
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
}

.link-item__anchor:hover {
    text-decoration: underline;
}

.link-input {
    width: 100%;
    padding: 4px 8px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 4px;
    background: transparent;
    color: inherit;
    font-size: 0.875rem;
    outline: none;
    box-sizing: border-box;
}

.link-input:focus {
    border-color: rgb(var(--v-theme-primary));
}

.link-item__actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
}

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

.icon-btn--danger .mdi {
    color: rgb(var(--v-theme-error));
}

.icon-btn .mdi {
    font-size: 16px;
}
</style>
