<script setup lang="ts">
const listsStore = useListsStore();
const router = useRouter();

const completedOpen = ref(false);
const quickAddText = ref('');

onBeforeMount(async () => {
  await listsStore.getCurrentList();

  const defaultView = listsStore.currentList?.defaultView as ViewType | undefined;
  if (defaultView && tabs.value.includes(defaultView)) {
    currentTab.value = defaultView;
  }
});

if (!listsStore.currentList) {
    navigateTo('/');
}

if (listsStore.currentList) {
    useHead({
        title: `TickUp:${listsStore.currentList.name}`,
    });
}

watch(listsStore.currentList.todos, (todos: Todo[]) => {
    if (!todos) return;
    on.value = todos.filter((todo: Todo) => todo.selected).length > 0;
});

function updateListType(listType) {
    console.log('updateListType', listType);
    listsStore.currentList.listType = listType;
    listsStore.updateList();
}
</script>

<template>
    <v-container
        fluid
        class="fill-height"
    >
        <v-row class="fill-height">
            <ListHeader />
            <v-col
                class="fill-height d-flex flex-column"
                cols="12"
            >
                <v-tabs v-model="currentTab">
                    <v-tab
                        v-for="tab in tabs"
                        :key="tab"
                        :text="tab"
                        :value="tab"
                    />
                </v-tabs>
                <v-window
                    v-model="currentTab"
                    :touch="false"
                    class="mt-4"
                >
                    <v-window-item
                        value="board"
                        class=""
                    >
                        <Board />
                    </v-window-item>
                    <v-window-item
                        value="list"
                        class="fill-height"
                    >
                        <v-row>
                            <v-col>
                                <TodoNew />
                            </v-col>
                            <v-col cols="auto">
                                <ListType
                                    :current-list-type="listsStore.currentList.listType"
                                    @list-type-updated="(listType) => updateListType(listType)"
                                />
                            </v-col>
                        </v-row>
                        <div class="list-layout">
                            <div class="list-layout__list">
                                <ListTable v-if="listsStore.currentList.listType === 'table'" />
                                <ListSimple v-else />
                            </div>
                            <Transition name="panel">
                                <TodoPanel
                                    v-if="listsStore.panelOpen"
                                    @close="listsStore.panelOpen = false"
                                />
                            </Transition>
                        </div>
                    </v-window-item>
                </v-window>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.list-layout {
    display: flex;
    height: calc(100vh - 200px);
    min-height: 0;
}

.list-layout__list {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
}

.panel-enter-active,
.panel-leave-active {
    transition:
        transform 0.22s ease,
        opacity 0.22s;
}

.panel-enter-from,
.panel-leave-to {
    transform: translateX(20px);
    opacity: 0;
}
</style>
