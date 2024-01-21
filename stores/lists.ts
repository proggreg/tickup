interface listsState {
  lists: List[],
  currentList: List,
  currentTodo: Todo,
  todos?: Todo[]
}

export const useListsStore = defineStore('lists', {
  state: () : listsState => ({
    lists: [],
    currentList: {
      name: '',
      todos: []
    },
    currentTodo: {
      name: '',
      status: 'Done',
      desc: ''
    },
    todos: []
  }),
  actions: {
    async addList (listName: string) {
      if (listName) {
        const newListData = { name: listName, todos: [] }

        this.lists.push(newListData)
        this.currentList = newListData
        const newList = await $fetch<List>('/api/list/create', {
          method: 'POST',
          body: newListData
        })

        this.lists[this.lists.length - 1]._id = newList._id

        return newList
      }
    },
    setLists (lists: Array<List>) {
      this.lists = lists
    },
    async deleteList (listId: string) {
      if (listId) {
        const data = await $fetch<List>(`/api/list/${listId}`, {
          method: 'DELETE'
        })

        this.lists = this.lists.filter(list => list._id !== data._id)
      }
    },
    async deleteTodo (todoId : string) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const todo = await $fetch(`/api/list/todo/${todoId}`, {
        method: 'DELETE'
      })
      // TODO do i need todo?

      this.getTodos()

      if (!this.currentList) { return }
      this.currentList.todos = this.currentList.todos.filter(todo => todo._id !== todoId)
    },
    setListName (newName: string) {
      this.currentList.name = newName
    },
    setListTodos (todos: Todo[]) {
      this.currentList.todos = todos || []
    },
    async addTodo (newTodo: Todo) {
      const todo = await $fetch<Todo>('/api/list/todo', {
        method: 'POST',
        body: newTodo
      })
      this.currentList.todos.push(todo)
      return todo
    },
    async getListTodos (listId: string) {
      const { data } = await useFetch<Todo[]>(`/api/list/todo/${listId}`)

      if (data.value) {
        this.setListTodos(data.value)
      }
    },
    setCurrentTodo (currentTodo: Todo) {
      this.currentTodo = currentTodo
    },
    setDueDate (date: Date) {
      if (this.currentTodo) {
        this.currentTodo.dueDate = date
      }
    },
    setTaskName (name :string, index: number) {
      if (!this.currentTodo || !this.currentList) { return }
      this.currentList.todos[index].name = name
    },
    async getLists () {
      const { data } = await useFetch<List[]>('/api/lists')

      if (data.value) {
        this.setLists(data.value)
      }
    },
    async getList (id: string) {
      const { data } = await useFetch<List>(`/api/list/${id}`)

      if (data.value) {
        this.currentList = data.value
      }
    },
    async getTodos () {
      const { data } = await useFetch<Todo[]>('/api/today')

      if (data.value) {
        this.todos = data.value
      }
    },
    async updateTodo (todo: Todo) {
      const updatedTodo = await $fetch<Todo>(`/api/list/todo/${todo._id}`, {
        method: 'PUT',
        body: todo
      })
      this.setCurrentTodo(updatedTodo)
    },
    sortByDate (newDirection: string) {
      this.currentList.todos
        .sort((a, b) => {
          const dateA = a.dueDate ? new Date(a.dueDate) : null
          const dateB = b.dueDate ? new Date(b.dueDate) : null

          if (!dateA && !dateB) {
            return 0
          }
          if (!dateA) {
            return -1
          }
          if (!dateB) { return -1 }
          const result = dateA - dateB

          return newDirection === 'ascending' ? result : -result
        })
    }
  }
})
