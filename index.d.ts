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
    links: {
      title: string
      url: string
    }[]
    subtasks?: {
      name: string
      status: string
      _id: string
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
    _id?: string
    image?: string
    icon: string
  }

  interface Settings {
    statuses: Status[]
  }

  type View = 'list' | 'board'

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
