export { Todo, Status, List }
declare global {
  interface Todo {
    userId?: string
    name: string
    _id?: string
    dueDate?: Date
    listId?: string
    status: string
    desc?: string
    edit: boolean
    selected?: boolean
    color: string
    githubBranchName?: string
  }

  interface Status {
    name: string
    color: string
    todos?: Todos[]
    Edit?: boolean
  }

  interface List {
    userId?: string
    name: string
    todos: Todo[]
    _id?: string
  }

  interface Settings {
    statuses: Status[]
  }

  type View = 'list' | 'board'

}
