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
    links: {
      title: string
      url: string
    }[]
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
    icon: string
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
  
  declare module '#app' {
    interface NuxtApp {
      $pwa: UnwrapNestedRefs<PwaInjection>
    }
  }

}
