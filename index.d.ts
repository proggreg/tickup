import type { ObjectId } from 'mongoose'

export { Todo, Status, List, Settings }
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
    order: number
  }

  interface Status {
    name: string
    color: string
    todos?: Todos[]
    Edit?: boolean
  }

  type ListType = 'status' | 'simple'

  interface List {
    userId?: string
    name: string
    todos: Todo[]
    description?: string
    _id?: string
    image?: string
    listType: ListType
  }

  interface Settings {
    statuses: Status[]
    pusherAppId?: string
    pusherKey?: string
    pusherSecret?: string
    pusherCluster?: string
  }

  type View = 'list' | 'board'

  type Role = 'user' | 'model'

  interface Part {
    text: string
  }

  interface ChatHistory {
    role: Role
    parts: Part[]
  }

  interface Task {
    name: string
    prompt: string
    cron: string
    _id: ObjectId
    userId?: string
  }
}
