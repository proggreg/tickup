<script setup lang="ts">
const listsStore = useListsStore();
const tabs = ref<View[]>(['board', 'list']);
const currentTab = ref<View>('list');
watch(currentTab, (newTab) => {
    listsStore.setView(newTab);
});
</script>

<template>
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
        class=""
    >
        <v-window-item value="board">
            <Board />
        </v-window-item>
        <v-window-item
            value="list"
            class="fill-height"
        >
            <ListTable />
        </v-window-item>
    </v-window>
</template>
