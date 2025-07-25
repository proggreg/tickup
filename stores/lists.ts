interface listsState {
  lists: List[]
  currentList: List
  newList: List
  currentTodo: Todo
  todos?: Todo[]
  todaysTodos: Todo[]
  overdueTodos: Todo[]
  view: View
  newTodo: Todo
}

const newTodoState = {
  name: '',
  status: 'Open',
  desc: '',
  edit: false,
  color: '#87909e',
  links: [],
  attachments: [],
}

const newListState = {
  name: '',
  todos: [],
  icon: 'mdi-format-list-bulleted',
}
export const useListsStore = defineStore('lists', {
  state: (): listsState => ({
    newTodo: newTodoState,
    currentTodo: newTodoState,
    newList: newListState,
    currentList: newListState,
    view: 'list',
    lists: [],
    todos: [],
    todaysTodos: [],
    overdueTodos: [],
  }),
  actions: {
    async addList(newList?: List) {
      if (!newList) {
        newList = this.newList
      }
      if (newList) {
        this.lists.push(newList)
        this.currentList = newList
        const list = await $fetch<List>('/api/list', {
          method: 'POST',
          body: newList,
        })

        this.lists[this.lists.length - 1]._id = list._id

        return newList
      }
    },
    async updateList(list?: List) {
      console.time('updateList')

      if (!list) {
        list = this.currentList
      }

      if (!list.name) return

      const updatedList = await $fetch<List>(`/api/list/${list._id}`, {
        method: 'PUT',
        body: list,
      })

      this.setLists(
        this.lists.map(l => (l._id === updatedList._id ? updatedList : l)),
      )
      console.timeEnd('updateList')
    },
    setLists(lists: Array<List>) {
      this.lists = lists
    },
    async deleteList(listId?: string) {
      if (!listId) {
        listId = this.currentList._id
      }

      try {
        console.log(`delete list ${listId}`)
        this.lists = this.lists.filter(list => list._id !== listId)
        const data = await $fetch<List>(`/api/list/${listId}`, {
          method: 'DELETE',
        })
        if (data) {
          console.log(`list ${listId} deleted`)
        }
      }
      catch (err) {
        console.error(err)
      }
    },
    setListName(newName: string) {
      if (!this.currentList) {
        return
      }
      this.currentList.name = newName
    },
    setListTodos(todos: Todo[]) {
      this.currentList.todos = todos || []
    },
    async getListTodos(listId: string): Promise<Todo[]> {
      const todos = await $fetch<Todo[]>(`/api/list/todos`, { query: { listId } })
      return todos || []
    },
    async addTodo(newTodo: Todo) {
      if (newTodo._id) {
        console.warn('todo already has an id', newTodo)
        return
      }
      if (!this.currentList.todos) this.currentList.todos = []
      
      const newTodoTempId = crypto.randomUUID()
      this.currentList.todos.push({...newTodo, _id: newTodoTempId })

      const todo = await $fetch<Todo>('/api/todo', {
        method: 'POST',
        body: newTodo,
      })

      if (!todo) {
        console.error('Failed to add todo')
        return
      }

      // update the added todo with the server-generated ID
      this.currentList.todos = this.currentList.todos.map(t =>
        t._id === newTodoTempId ? { ...t, _id: todo._id } : t,
      )
      

      this.newTodo = {
        name: '',
        status: 'Open',
        desc: '',
        edit: false,
        color: '#87909e',
        links: [],
        attachments: [],
      }

      this.currentList.todos[this.currentList.todos.length - 1]._id = todo._id

      console.log('todo added', todo)
      return todo
    },
    async updateTodo(todo?: Todo) {
      if (!todo) {
        todo = this.currentTodo
      }

      const updatedTodo = await $fetch<Todo>(`/api/todo/${todo._id}`, {
        method: 'PUT',
        body: todo,
      })
      console.log('updatedTodo', updatedTodo)
      return updatedTodo
    },
    async deleteTodo(id: string) {
      await $fetch(`/api/todo/${id}`, { method: 'DELETE' })

      this.currentList.todos = this.currentList.todos.filter(
        todo => todo._id !== id,
      )

      if (this.todaysTodos.length) {
        this.todaysTodos = this.todaysTodos.filter(todo => todo._id !== id)
      }
    },
    setCurrentList(list: List) {
      if (list) {
        this.currentList = list
      }
    },
    setCurrentListName(name: string) {
      this.currentList.name = name
    },
    setView(view: 'list' | 'board') {
      this.view = view
    },
    setCurrentTodo(currentTodo: Todo) {
      this.currentTodo = currentTodo
    },
    setDueDate(date: Date) {
      if (this.currentTodo) {
        this.currentTodo.dueDate = date
      }
    },
    setTaskName(name: string, index: number) {
      if (!this.currentTodo || !this.currentList) {
        return
      }
      this.currentList.todos[index].name = name
    },
    async getLists(userId: string) {
      const lists = await $fetch<List[]>('/api/lists', { query: { id: userId } })
      if (!lists) return

      for (const list of lists) {
        if (!list._id) continue
        const todos = await this.getListTodos(list._id)
        list.todos = todos
      }

      if (lists) {
        this.setLists(lists)
      }
    },
    async getList(id: string) {
      const { data } = await useFetch<List>(`/api/list/${id}`)

      if (data.value) {
        this.currentList = data.value
        return this.currentList
      }
    },
    async getTodo(id: string) {
      const { data } = await useFetch<Todo>(`/api/todo/${id}`)

      if (data.value) {
        this.currentTodo = data.value
      }

      return data
    },
    async getTodos(userId: string) {
      const { data } = await useFetch<Todo[]>('/api/todos', {
        query: { userId },
      })

      if (data.value) {
        this.todos = data.value
      }
    },
    async getTodaysTodos(id: string) {
      const { data } = await useFetch<Todo[]>('/api/todos', {
        query: { today: true, id },
      })

      if (data.value) {
        this.todaysTodos = data.value
      }
    },
    async getOverdueTodos(id: string) {
      const todos = await $fetch<Todo[]>('/api/todos', {
        query: { overdue: true, id },
      })

      if (todos) {
        this.overdueTodos = todos
      }
    },
    sortByDate(newDirection: string) {
      this.currentList.todos.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : null
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : null

        if (!dateA && !dateB) {
          return 0
        }
        if (!dateA) {
          return -1
        }
        if (!dateB) {
          return -1
        }
        const result = dateA - dateB

        return newDirection === 'ascending' ? result : -result
      })
    },

    newReset() {
      console.log('newReset')
      this.newTodo = {
        name: '',
        status: 'Open',
        desc: '',
        edit: false,
        color: '#87909e',
        links: [],
        attachments: [],
      }
      this.newList = {
        name: '',
        todos: [],
        icon: 'mdi-format-list-bulleted',
      }
    },
  },
  // persist: {
  //   debug: true,
  //   storage: piniaPluginPersistedstate.sessionStorage(),
  // },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useListsStore, import.meta.hot))
}
