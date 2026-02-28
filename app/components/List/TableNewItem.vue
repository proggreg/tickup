<script setup lang="ts">
const newTodoVariant = ref<'text' | 'outlined'>('text');
const openNewTodo = ref(false);
const listStore = useListsStore();
const newTodo = ref(createNewTodoState());

const { groupItem } = defineProps<{
    groupItem: Record<string, unknown>;
}>();
// const { params } = useRoute();

async function createTodo(status: string) {
    newTodo.value.status = status;
    if (newTodo.value.name) {
        // const newTodo: Todo = {
        //     name: newTodoTitle.value,
        //     status,
        //     desc: '',
        //     listId: params.id as string,
        //     // userId: userId.value,
        //     color: 'grey',
        //     edit: false,
        //     links: [],
        // };
        await listStore.addTodo(newTodo.value);
        newTodo.value = createNewTodoState();
        openNewTodo.value = false;
    }
}
</script>

<template>
    <tr>
        <td
            v-if="!openNewTodo"
            colspan="5"
        >
            <v-btn
                elevation="0"
                @click="openNewTodo = true"
                @mouseover="newTodoVariant = 'outlined'"
                @mouseleave="newTodoVariant = 'text'"
            >
                Add Todo
            </v-btn>
        </td>

        <td
            v-else
            colspan="5"
        >
            <v-text-field
                v-model="newTodo.name"
                autofocus
                variant="plain"
                placeholder="new todo"
                data-testid="table-new-todo-input"
                @blur="createTodo(groupItem.value as string)"
                @keyup.enter="$event.target.blur()"
            />
        </td>
    </tr>
</template>
