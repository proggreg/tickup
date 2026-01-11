<script setup lang="ts">
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
                        style="cursor: pointer;"
                        :data-test-id="item.name"
                        :to="`/list/${item.id}`"
                    >
                        <v-text-field
                            v-if="editListName === item.id"
                            v-model="item.name"
                            class="font-weight-bold "
                            autofocus
                            variant="plain"
                            @input.stop="() => rename(item)"
                            @keyup.enter="renameList(item)"
                            @blur="renameList(item)"
                        />
                        <v-list-item-title v-else>
                            {{ item.name }}
                        </v-list-item-title>
                        <template #prepend>
                            <v-icon v-if="item.icon">
                                {{ item.icon }}
                            </v-icon>
                            <v-icon v-else>
                                mdi-format-list-bulleted
                            </v-icon>
                        </template>
                        <template #append>
                            <list-settings-button :list-id="item.id" />
                        </template>
                    </v-list-item>
                    <v-divider v-if="isMobile" />
                </template>
            </v-hover>
        </template>
    </v-virtual-scroll>
</template>

<style scoped>
  /* .nav-items-scroll {
    height: 100%;
    max-height: 100%;
    overflow-y: auto;
  }

  .nav-item-title {
    text-transform: capitalize !important;
    font-weight: bold;

    @media (min-width: 600px) {
      font-size: 1rem !important;
    }
  } */
</style>
