const createNewListState = (): List => ({
    name: '',
    todos: [],
    icon: 'mdi-format-list-bulleted',
    listType: 'simple',
});

const createNewTodoState = (): Todo => ({
    name: '',
    status: 'Open',
    desc: '',
    edit: false,
    color: '#87909e',
    links: [],
    attachments: [],
});

export const useListsStore = defineStore('lists', {
    state: (): listsState => ({
        newTodo: createNewTodoState(),
        currentTodo: createNewTodoState(),
        newList: createNewListState(),
        currentList: createNewListState(),
        view: 'list',
        lists: [],
        todos: [],
        todaysTodos: [],
        overdueTodos: [],
    }),
    actions: {
        async addList(newList?: List) {
            console.log('add list');
            const user = useSupabaseUser();

            if (!user.value?.id) {
                console.error('User not authenticated');
                return;
            }

            if (!newList) {
                newList = this.newList;
            }
            if (newList) {
                this.lists.push(newList);

                // Prepare list data with user ID
                const listData = {
                    ...newList,
                    userId: user.value.id,
                };

                const list = await $fetch<List>('/api/list', {
                    method: 'POST',
                    body: listData,
                });

                this.lists[this.lists.length - 1].id = list.id;

                return newList;
            }
        },
        async updateList(listToUpdate?: List) {
            const { isOnline } = useOfflineSync();

            if (!listToUpdate) {
                listToUpdate = this.currentList;
            }

            if (!isOnline) {
                // logger.log('Skipping list update - offline')
                return;
            }

            await $fetch<List>(`/api/list/${listToUpdate.id}`, {
                method: 'PUT',
                body: listToUpdate,
            });
        },
        setLists(lists: Array<List>) {
            this.lists = lists;
        },
        async deleteList(listId?: string) {
            if (!listId) {
                listId = this.currentList.id;
            }

            try {
                this.lists = this.lists.filter((list: List) => list.id !== listId);
                await $fetch<List>(`/api/list/${listId}`, {
                    method: 'DELETE',
                });
                navigateTo('/');
            }
            catch {
                // logger.error(err as Error, { component: 'ListsStore', function: 'deleteList', listId })
            }
        },
        setListName(newName: string) {
            if (!this.currentList) {
                return;
            }
            this.currentList.name = newName;
        },
        setListTodos(todos: Todo[]) {
            if (!todos || !todos.length) return;
            this.currentList.todos = todos;
        },
        async getListTodos(listId?: string): Promise<Todo[]> {
            if (!listId) {
                listId = this.currentList.id;
            }
            const todos = await $fetch<Todo[]>(`/api/list/todos`, { query: { listId } });
            this.currentList.todos = todos;
            return todos || [];
        },
        async addTodo(newTodo: Todo) {
            if (!this.currentList.todos) this.currentList.todos = [];

            this.currentList.todos.push(newTodo);

            const todo = await $fetch<Todo>('/api/todo', {
                method: 'POST',
                body: newTodo,
            });

            console.log('add todo', todo);

            this.currentList.todos[this.currentList.todos.length - 1].id = todo.id;

            this.resetTodo();

            return todo;
        },
        async updateTodo(todo?: Todo) {
            if (!todo) {
                todo = this.currentTodo;
            }

            const updatedTodo = await $fetch<Todo>(`/api/todo/${todo.id}`, {
                method: 'PUT',
                body: todo,
            });

            return updatedTodo;
        },
        async deleteTodo(id: string) {
            await $fetch(`/api/todo/${id}`, { method: 'DELETE' });

            this.currentList.todos = this.currentList.todos.filter(
                (todo: Todo) => todo.id !== id,
            );
        },
        async getTodo(id: string) {
            const { data } = await useFetch<Todo>(`/api/todo/${id}`);

            if (data.value) {
                this.currentTodo = data.value;
            }

            return data;
        },
        async getTodos() {
            const { data } = await useFetch<Todo[]>('/api/todos');

            if (data.value) {
                this.todos = data.value;
            }
        },
        setCurrentList(list: List) {
            if (list) {
                this.currentList = list;
            }
        },
        setCurrentListName(name: string) {
            this.currentList.name = name;
        },
        setView(view: 'list' | 'board') {
            this.view = view;
        },
        setCurrentTodo(currentTodo: Todo) {
            this.currentTodo = currentTodo;
        },
        setDueDate(date: Date) {
            if (this.currentTodo) {
                this.currentTodo.dueDate = date;
            }
        },
        setTaskName(name: string, index: number) {
            // Ensure the index is valid and the todo exists before setting the name
            if (
                !this.currentList
                || !Array.isArray(this.currentList.todos)
                || index < 0
                || index >= this.currentList.todos.length
            ) {
                return;
            }
            this.currentList.todos[index].name = name;
        },
        async getLists() {
            const lists = await $fetch<List[]>('/api/lists');
            console.log('get lists', lists);
            this.setLists(lists);
        },
        async getList(id: string) {
            const { data } = await useFetch<List>(`/api/list/${id}`);

            if (data.value) {
                this.currentList = data.value;
                return this.currentList;
            }
        },

        async getTodaysTodos(id?: string) {
            const user = useSupabaseUser();
            const actualUserId = id || user.value?.id;

            if (!actualUserId) {
                console.error('User ID not available');
                return;
            }

            const { data } = await useFetch<Todo[]>('/api/todos', {
                query: { today: true, id: actualUserId },
            });

            if (data.value) {
                this.todaysTodos = data.value;
            }
        },
        async getOverdueTodos(id?: string) {
            const user = useSupabaseUser();
            const actualUserId = id || user.value?.id;

            if (!actualUserId) {
                console.error('User ID not available');
                return;
            }

            const todos = await $fetch<Todo[]>('/api/todos', {
                query: { overdue: true, id: actualUserId },
            });

            if (todos) {
                this.overdueTodos = todos;
            }
        },
        sortByDate(newDirection: string) {
            this.currentList.todos.sort((a, b) => {
                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : null;
                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : null;

                if (!dateA && !dateB) {
                    return 0;
                }
                if (!dateA) {
                    return -1;
                }
                if (!dateB) {
                    return -1;
                }
                const result = dateA - dateB;

                return newDirection === 'ascending' ? result : -result;
            });
        },
        newResetAll() {
            this.resetList();
            this.resetTodo();
        },
        resetTodo() {
            this.newTodo = createNewTodoState();
        },
        resetList() {
            this.newList = createNewListState();
        },

    },
    // persist: {
    //   debug: true,
    //   storage: piniaPluginPersistedstate.localStorage(),
    // },
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useListsStore, import.meta.hot));
}
