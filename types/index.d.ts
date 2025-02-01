export { Todo, Status, List, Priorities, Settings, View, Link }
declare global {

  interface List {
    userId?: string
    name: string
    todos: Todo[]
    _id?: string
    image?: string
  }

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
    links: Link[]
    priority: Priorities
  }

  interface Status {
    name: string
    color: string
    todos?: Todos[]
    Edit?: boolean
  }

  enum Priorities {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
  }

  interface Settings {
    statuses: Status[]
  }

  type View = 'list' | 'board'

  interface Link {
    title: string
    url: string
    _id: string
  }
}
