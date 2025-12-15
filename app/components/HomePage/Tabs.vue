<script setup lang="ts">
const { userId: _userId } = useCurrentUser();
const modelValue = defineModel<string>({ default: 'todo' });
const listsStore = useListsStore();

watch(() => modelValue.value, (_newTab) => {
    listsStore.getTodaysTodos?.();
});

onBeforeMount(() => {
    listsStore.getTodaysTodos();
});
</script>

<template>
    <v-tabs
        v-model="modelValue"
        grow
        align-tabs="center"
        :hide-slider="false"
        class="mb-4"
    >
        <v-tab
            value="overdue"
            class="text-h5"
        >
            Overdue
        </v-tab>
        <v-tab
            value="todo"
            class="text-h5"
        >
            Todo
        </v-tab>
        <v-tab
            value="done"
            class="text-h5"
        >
            Done
        </v-tab>
    </v-tabs>
</template>
