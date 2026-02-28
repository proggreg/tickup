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
                        @click="openList(item.id)"
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
                            <div
                                class="nav-more-wrapper"
                                @click.stop
                                @mousedown.stop
                                @touchstart.stop
                            >
                                <v-menu>
                                    <template #activator="{ props: menuProps }">
                                        <v-btn
                                            v-bind="menuProps"
                                            icon
                                            variant="text"
                                            density="comfortable"
                                            class="nav-more-btn"
                                        >
                                            <v-icon>mdi-dots-vertical</v-icon>
                                        </v-btn>
                                    </template>
                                    <v-list density="compact">
                                        <v-list-item @click.stop="deleteList(item.id)">
                                            <v-list-item-title class="text-error">
                                                Delete list
                                            </v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </div>
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
