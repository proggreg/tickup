export const createNewListState = (): List => ({
    name: '',
    todos: [],
    icon: 'mdi-format-list-bulleted',
    listType: 'simple',
});

export const createNewTodoState = (): Todo => ({
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
        async addList(): Promise<List> {
            console.log('add list');

            if (this.newList) {
                try {
                    this.lists.push(this.newList);

                    const list = await $fetch<List>('/api/list', {
                        method: 'POST',
                        body: this.newList,
                    });

                    this.lists[this.lists.length - 1].id = list.id;

                    this.resetList();
                    return list;
                }
                catch (error: any) {
                    // Remove the list from the optimistic update
                    this.lists.pop();

                    // Set error using showError to trigger useError()
                    const errorMessage = error?.data?.message || error?.message || 'Failed to create list';
                    showError({
                        statusCode: error?.statusCode || 500,
                        statusMessage: errorMessage,
                    });
                    throw error;
                }
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
        setLists(lists: Array<List>) {
            this.lists = lists;
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
            console.log('getListTodos');
            if (!listId) {
                listId = this.currentList.id;
            }
            const todos = await $fetch<Todo[]>(`/api/list/todos`, { query: { listId } });
            console.log('getListTodos num of todos', todos.length);
            this.currentList.todos = todos;
            return todos || [];
        },
        setCurrentList(list: List) {
            if (list) {
                this.currentList = list;
            }
        },
        async getCurrentList() {
            const route = useRoute();
            if (this.currentList.id == route.params.id) return;

            this.currentList = await $fetch(`/api/list/${route.params.id}`);
            console.log('get current list', this.currentList);
        },
        validateTodo(todo: Todo) {
            let valid = true;
            if (!todo.name) {
                showError({
                    statusCode: 400,
                    statusMessage: 'Todo name is required',
                });
                valid = false;
            }
            return valid;
        },
        async addTodo(newTodo?: Todo) {
            const todo = newTodo !== undefined ? newTodo : this.newTodo;
            console.debug('Create Todo', todo);
            if (!this.validateTodo(todo)) {
                return;
            }

            this.setTodoDetails(todo);

            this.optimisticallyUpdateTodos(todo);

            const createdTodo = await $fetch<Todo>('/api/todo', {
                method: 'POST',
                body: todo,
            });

            console.debug('Todo created!', createdTodo);

            this.updateTodosId(createdTodo);

            this.resetTodo();

            return todo;
        },
        updateTodosId(todo: Todo) {
            const route = useRoute();
            if (route.path.includes('list')) {
                this.currentList.todos[this.currentList.todos.length - 1].id = todo.id;
            }
            else {
                this.todaysTodos[this.todaysTodos.length - 1].id = todo.id;
            }
        },
        optimisticallyUpdateTodos(todo: Todo) {
            const route = useRoute();
            if (route.path.includes('list')) {
                this.currentList.todos.push(todo);
            }
            else {
                this.todaysTodos.push(todo);
            }
        },
        setTodoDetails(todo: Todo) {
            const route = useRoute();
            const isListRoute = route.path.includes('list');

            if (isListRoute) {
                this.addListId(route, todo);
            }
            else {
                const now = new Date();
                this.setNewTodoDueDate(now);
            }
        },
        addListId(route, todo) {
            const listIdParam = route.params?.id;
            if (Array.isArray(listIdParam)) {
                todo.listId = listIdParam[0];
            }
            else {
                todo.listId = listIdParam;
            }
        },
        setNewTodoDueDate(newDueDate: Date) {
            this.newTodo.dueDate = newDueDate;
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

        async getTodaysTodos() {
            const todos = await $fetch<Todo[]>('/api/todos', {
                query: { today: true },
            });

            if (todos) {
                this.todaysTodos = todos;
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

// if (import.meta.hot) {
//     import.meta.hot.accept(acceptHMRUpdate(useListsStore, import.meta.hot));
// }
