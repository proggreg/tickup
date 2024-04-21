interface listsState {
  lists: List[],
  currentList: List,
  currentTodo: Todo,
  todos?: Todo[]
  todaysTodos: Todo[]
  view: View
}

export const useListsStore = defineStore('lists', {
  state: (): listsState => ({
    lists: [],
    currentList: {
      name: '',
      todos: [],
    },
    view: 'list',
    currentTodo: {
      name: '',
      status: 'Open',
      desc: '',
      userId: undefined,
      _id: ""
    },
    todos: [],
    todaysTodos: []
  }),
  actions: {
    async addList(newList: List) {
      if (newList) {
        this.lists.push(newList);
        this.currentList = newList;
        const list = await $fetch<List>('/api/list', {
          method: 'POST',
          body: newList
        });

        this.lists[this.lists.length - 1]._id = list._id;

        return newList;
      }
    },
    async updateList(list: List) {
      
      console.time('updateList')
      console.log('update list')
      
      

      const updatedList = await $fetch<List>(`/api/list/${list._id}`, {
        method: 'PUT',
        body: list
      });

      this.setLists(this.lists.map(l => l._id === updatedList._id ? updatedList : l));
      console.timeEnd('updateList')
    },
    setLists(lists: Array<List>) {
      this.lists = lists;
    },
    async deleteList(listId: string) {
      if (listId) {
        const data = await $fetch<List>(`/api/list/${listId}`, {
          method: 'DELETE'
        });

        this.lists = this.lists.filter(list => list._id !== data._id);
      }
    },
    setListName(newName: string) {
      if (!this.currentList) { return; }
      this.currentList.name = newName;
    },
    setListTodos(todos: Todo[]) {
      this.currentList.todos = todos || [];
    },
    async getListTodos(listId: string) {
      const { data } = await useFetch<Todo[]>(`/api/list/todo/${listId}`);

      if (data.value) {
        this.setListTodos(data.value);
      }
    },
    
    async addTodo(newTodo: Todo) {
      const todo = await $fetch<Todo>('/api/todo', {
        method: 'POST',
        body: newTodo
      });
      this.currentList.todos.push(todo);
      return todo;
    },
    async updateTodo(todo: Todo) {
      const updatedTodo = await $fetch<Todo>(`/api/todo/${todo._id}`, {
        method: 'PUT',
        body: todo
      });
      return updatedTodo;
    },
    async deleteTodo(id: string) {
      await $fetch(`/api/todo/${id}`, { method: 'DELETE' });

      if (this.todaysTodos.length) {
        this.todaysTodos = this.todaysTodos.filter(todo => todo._id !== id);
      }
    },
    setCurrentList(list: List) {
      this.currentList = list;
    },
    setCurrentListName(name: string) { 
      this.currentList.name = name; 
    },
    setView(view: "list" | "board") {
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
      if (!this.currentTodo || !this.currentList) { return; }
      this.currentList.todos[index].name = name;
    },
    async getLists(id: string) {
      const { data } = await useFetch<List[]>('/api/lists', { query: { id } });

      if (data.value) {
        this.setLists(data.value);
      }
    },
    async getList(id: string) {
      const { data } = await useFetch<List>(`/api/list/${id}`);

      if (data.value) {
        this.currentList = data.value;
        return this.currentList;
      }
    },
    async getTodo(id: string) {
      const { data } = await useFetch<Todo>(`/api/todo/${id}`);

      if (data.value) {
        this.currentTodo = data.value;
      }

      return data;
    },
    async getTodos(userId: string) {
      const { data } = await useFetch<Todo[]>('/api/todos', { query: { userId } });

      if (data.value) {
        this.todos = data.value;
      }
    },
    async getTodaysTodos(id: string) {
      const { data } = await useFetch<Todo[]>('/api/todos', { query: { today: true, id } });
      
      if (data.value) {
        this.todaysTodos = data.value;
      }
    },
    sortByDate(newDirection: string) {
      this.currentList.todos
        .sort((a, b) => {
          const dateA = a.dueDate ? new Date(a.dueDate) : null;
          const dateB = b.dueDate ? new Date(b.dueDate) : null;

          if (!dateA && !dateB) {
            return 0;
          }
          if (!dateA) {
            return -1;
          }
          if (!dateB) { return -1; }
          const result = dateA - dateB;

          return newDirection === 'ascending' ? result : -result;
        });
    }
  }
});
