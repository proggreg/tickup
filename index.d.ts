export { Todo, Status, List }
declare global {

  type ViewType = 'list' | 'board'
  type ListType = 'simple' | 'table'

  interface Todo {
    userId?: string
    name: string
    id?: string
    dueDate?: Date
    listId?: string
    status: string
    desc?: string
    edit: boolean
    selected?: boolean
    color: string
    githubBranchName?: string
    links: {
      title: string
      url: string
    }[]
    subtasks?: {
      name: string
      status: string
      _id: string
    }[]
    attachments?: {
      _id: ObjectId
      attachmentId: string
      filename: string
      originalName: string
      mimeType: string
      size: number
      uploadedAt: Date
    }[]
    notificationDateTime?: string | Date
    notificationSent?: boolean
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
    id?: string
    image?: string
    listType: ListType
    icon: string
  }

  interface listsState {
    lists: List[]
    currentList: List
    newList: List
    currentTodo: Todo
    todos?: Todo[]
    todaysTodos: Todo[]
    overdueTodos: Todo[]
    view: ViewType
    newTodo: Todo
  }

  interface Settings {
    statuses: Status[]
  }

  export interface PwaInjection {
    /**
     * @deprecated use `isPWAInstalled` instead
     */
    isInstalled: boolean
    /**
     * From version v0.3.5+.
     */
    isPWAInstalled: Ref<boolean>
    showInstallPrompt: Ref<boolean>
    cancelInstall: () => void
    install: () => Promise<void>
    swActivated: Ref<boolean>
    registrationError: Ref<boolean>
    offlineReady: Ref<boolean>
    needRefresh: Ref<boolean>
    updateServiceWorker: (reloadPage?: boolean | undefined) => Promise<void>
    cancelPrompt: () => Promise<void>
    getSWRegistration: () => ServiceWorkerRegistration | undefined
  }

  // types/offline.ts (or add to your existing types file)
  export interface PendingChange {
    id: string | number
    action: string
    endpoint: string
    method: string
    data: any
    timestamp: number
    synced: boolean
    retryCount: number
    syncedAt?: number
    tempId?: string
    listId?: string
    todoId?: string
    optimisticUpdate?: OptimisticUpdate
  }

  export interface OptimisticUpdate {
    type: 'list' | 'todo' | 'delete_list' | 'delete_todo'
    tempId?: string
    id?: string
    listId?: string
    todoId?: string
    list?: any
    todo?: any
    index?: number
    updates?: any
  }

  declare module '#app' {
    interface NuxtApp {
      $pwa: UnwrapNestedRefs<PwaInjection>
    }
  }

}
