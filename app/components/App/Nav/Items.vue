<script setup lang="ts">
import { Input } from '@vuetify/v0';

const store = useListsStore();
const editListName = ref('');
const { isMobile } = useDevice();

function renameList(list: List) {
    store.updateList(list);
    editListName.value = '';
}

function rename(list: List) {
    if (store.currentList.id === list.id) {
        store.currentList = list;
    }
}

onBeforeMount(() => {
    store.getLists();
});
</script>

<template>
    <ul class="nav-items-scroll">
        <template
            v-for="item in store.lists"
            :key="item.id"
        >
            <li class="nav-list-item">
                <NuxtLink
                    :to="`/list/${item.id}`"
                    class="nav-list-link"
                    active-class="nav-list-link--active"
                    :data-test-id="item.name"
                >
                    <i class="mdi mdi-format-list-bulleted nav-list-icon" />

                    <Input.Root
                        v-if="editListName === item.id"
                        v-model="item.name"
                    >
                        <Input.Control
                            class="nav-item-input"
                            autofocus
                            @click.stop
                            @input.stop="() => rename(item)"
                            @keyup.enter="renameList(item)"
                            @blur="renameList(item)"
                        />
                    </Input.Root>

                    <span
                        v-else
                        class="nav-item-title"
                    >{{ item.name }}</span>

                    <div class="nav-list-append">
                        <ListMenu :list-id="item.id" />
                    </div>
                </NuxtLink>
            </li>
            <hr
                v-if="isMobile"
                class="nav-divider"
            >
        </template>
    </ul>
</template>

<style scoped>
.nav-items-scroll {
    list-style: none;
    margin: 0;
    padding: 0;
    height: 100%;
    max-height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
}

.nav-items-scroll::-webkit-scrollbar {
    display: none;
}

.nav-list-item {
    margin-bottom: 2px;
}

.nav-list-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: background 0.1s;
    min-height: 40px;
}

.nav-list-link:hover {
    background: rgba(var(--v-border-color), 0.08);
}

.nav-list-link--active {
    background: rgba(var(--v-theme-primary), 0.1);
    color: rgb(var(--v-theme-primary));
}

.nav-list-icon {
    font-size: 20px;
    flex-shrink: 0;
    opacity: 0.7;
}

@media (max-width: 600px) {
    .nav-list-link {
        min-height: 56px;
        padding-inline: 16px;
    }
}

.nav-item-title {
    flex: 1;
    text-transform: capitalize;
    font-weight: 600;
    font-size: 0.9375rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (max-width: 600px) {
    .nav-item-title {
        font-size: 1.1rem;
        line-height: 1.4;
    }
}

.nav-item-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 0.9375rem;
    font-weight: 600;
    text-transform: capitalize;
    color: inherit;
    font-family: inherit;
    padding: 0;
}

@media (max-width: 600px) {
    .nav-item-input {
        font-size: 1.1rem;
        line-height: 1.4;
    }
}

.nav-list-append {
    margin-left: auto;
    flex-shrink: 0;
}

.nav-divider {
    border: none;
    border-top: 1px solid rgba(var(--v-border-color), 0.1);
    margin: 2px 0;
}
</style>
