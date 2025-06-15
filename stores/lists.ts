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

const newListDefaults: List = {
  name: '',
  todos: [],
  _id: '',
  image: '',
  listType: 'simple',
  icon: ''
}

export const useListsStore = defineStore('lists', {
  state: (): listsState => ({
    newTodo: {
      name: '',
      status: 'Open',
      desc: '',
      edit: false,
      color: '#87909e',
      order: 0,
      links: [],
    },
    lists: [],
    currentList: newListDefaults,
    view: 'list',
    todos: [],
    todaysTodos: [],
    overdueTodos: [],
    newList: newListDefaults,
    currentTodo: {
      name: '',
      status: 'Open',
      desc: '',
      edit: false,
      color: '#87909e',
      order: 0,
      links: [],
    },
  }),
  actions: {
    // =====================
    // 1. List Management
    // =====================
    async addList(newList: List) {
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
      const listToUpdate = list || this.currentList

      const listTodos = listToUpdate.todos

      if (!listToUpdate || !listToUpdate._id) {
        throw Error('No valid list to update')
      }

      const updatedList = await $fetch<List>(`/api/list/${listToUpdate._id}`, {
        method: 'PUT',
        body: listToUpdate,
      })

      this.setLists(
        this.lists.map(l => (l._id === updatedList._id ? updatedList : l)),
      )
      // Optionally update currentList if it was the one updated
      if (this.currentList && this.currentList._id === updatedList._id) {
        updatedList.todos = listTodos
        this.currentList = updatedList
      }
      console.timeEnd('updateList')
    },
    async deleteList(listId: string) {
      try {
        if (listId) {
          this.lists = this.lists.filter(list => list._id !== listId)
          const data = await $fetch<List>(`/api/list/${listId}`, {
            method: 'DELETE',
          })
          if (data) {
            console.log(`list ${listId} deleted`)
          }
        }
      }
      catch (err) {
        console.error(err)
      }
    },
    setLists(lists: Array<List>) {
      this.lists = lists
    },
    setListName(newName: string) {
      if (!this.currentList) {
        return
      }
      this.currentList.name = newName
    },
    setListTodos(todos: Todo[]) {
      if (!todos || !todos.length) return

      console.log('set list todos', todos)
      this.currentList.todos = todos
    },
    async getLists(id: string) {
      const { data } = await useFetch<List[]>('/api/lists', { query: { id } })

      if (data.value) {
        this.setLists(data.value)
      }
    },
    async getList(id: string) {
      const list = await $fetch<List>(`/api/list/${id}`)

      if (list) {
        this.getListTodos(id)
        this.currentList = list
        return this.currentList
      }
    },
    async getListTodos(listId: string) {
      const todos = await $fetch<Todo[]>(`/api/list/todos`, { query: { id: listId } })

      if (todos) {
        this.setListTodos(todos)
      }

      return todos
    },

    // =====================
    // 2. Todo Management
    // =====================
    async addTodo(newTodo: Todo) {
      // Check if we are on the homepage before adding a todo
      const route = useRoute()
      const isHomepage = route.path === '/' || route.name === 'index'

      if (newTodo._id) {
        console.warn('todo already has an id', newTodo)
        return
      }

      if (isHomepage) {
        this.todaysTodos.push(newTodo)
      }
      else {
        this.currentList.todos.push(newTodo)
      }

      const todo = await $fetch<Todo>('/api/todo', {
        method: 'POST',
        body: newTodo,
      })

      if (!todo) {
        console.error('Failed to add todo')
        return
      }

      // update the added todo with the server-generated ID
      if (isHomepage) {
        this.todaysTodos[this.todaysTodos.length - 1]._id = todo._id
      }
      else {
        this.currentList.todos[this.currentList.todos.length - 1]._id = todo._id
      }
      

      this.newTodo = {
        name: '',
        status: 'Open',
        desc: '',
        edit: false,
        color: '#87909e',
        links: [],
        order: 0,
      }

      this.updateList()
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

    // =====================
    // 3. Current State Setters
    // =====================
    setCurrentList(list: List) {
      console.log('set current list', list)
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
      // Ensure the index is valid and the todo exists before setting the name
      if (
        !this.currentList
        || !Array.isArray(this.currentList.todos)
        || index < 0
        || index >= this.currentList.todos.length
      ) {
        return
      }
      this.currentList.todos[index].name = name
    },

    // =====================
    // 4. Special Queries
    // =====================
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
        order: 0,
      }
      this.newList = {
        name: '',
        todos: [],
        icon: 'mdi-format-list-bulleted',
        listType: 'simple',
        _id: '',
        image: '',
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
