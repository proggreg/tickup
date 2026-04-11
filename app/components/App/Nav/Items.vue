<script setup lang="ts">
const store = useListsStore();
const editListName = ref('');
const { isMobile } = useDevice();
const router = useRouter();

function renameList(list: List) {
    store.updateList(list);
    editListName.value = '';
}

function rename(list: List) {
    if (store.currentList.id === list.id) {
        store.currentList = list;
    }
}

function openList(listId: string) {
    if (!listId) return;
    router.push(`/list/${listId}`);
}

function deleteList(listId: string) {
    if (!listId) return;
    store.deleteList(listId);
}

onBeforeMount(() => {
    store.getLists();
});
</script>

<template>
    <v-virtual-scroll
        :item-size="1"
        :items="store.lists"
        class="pa-0 nav-items-scroll"
    >
        <template #default="{ item }">
            <v-hover>
                <template #default="{ props }">
                    <v-list-item
                        v-bind="props"
                        :key="item.id"
                        :disabled="!item.id"
                        class="nav-list-item"
                        style="cursor: pointer;"
                        :data-test-id="item.name"
                        :to="`/list/${item.id}`"
                        prepend-icon="mdi-format-list-bulleted"
                    >
                        <v-text-field
                            v-if="editListName === item.id"
                            v-model="item.name"
                            class="font-weight-bold nav-item-input"
                            autofocus
                            variant="plain"
                            @input.stop="() => rename(item)"
                            @keyup.enter="renameList(item)"
                            @blur="renameList(item)"
                        />

                        <v-list-item-title
                            v-else
                            class="nav-item-title text-truncate"
                        >
                            {{ item.name }}
                        </v-list-item-title>

                        <template #append>
                            <list-menu :list-id="item.id" />
                        </template>
                    </v-list-item>
                    <v-divider v-if="isMobile" />
                </template>
            </v-hover>
        </template>
    </v-virtual-scroll>
</template>

<style scoped>
.nav-items-scroll {
    height: 100%;
    max-height: 100%;
    overflow-y: auto;
}

.nav-item-title {
    text-transform: capitalize;
    font-weight: 600;
}

.nav-item-input {
    font-weight: 600;
}

@media (max-width: 600px) {
    .nav-list-item {
        min-height: 56px;
        padding-inline: 16px;
    }

    .nav-item-title {
        font-size: 1.1rem; /* ~17-18px for better tap targets on mobile */
        line-height: 1.4;
    }

    .nav-item-input :deep(input) {
        font-size: 1.1rem;
        line-height: 1.4;
    }
}

.nav-more-wrapper {
    display: flex;
    align-items: center;
}

.nav-more-btn {
    min-width: 32px;
}
</style>
