export { Task, Status, List };

declare global {
    type View = 'list' | 'board';
    type ListType = 'simple' | 'table' | '';

    interface Task {
        userId?: string;
        name: string;
        id?: string;
        dueDate?: Date;
        listId?: string;
        list?: List;
        status: string;
        desc?: string;
        edit?: boolean;
        selected?: boolean;
        color: string;
        priorityLev: string;
        githubBranchName?: string;
        githubRepo?: string;
        githubLink?: string;
        links: {
            id?: string;
            title: string;
            url: string;
        }[];
        parentId?: string;
        subtasks?: Task[];
        attachments?: {
            id: ObjectId;
            attachmentId: string;
            filename: string;
            originalName: string;
            mimeType: string;
            size: number;
            uploadedAt: Date;
        }[];
        notificationDateTime?: string | Date;
        notificationSent?: boolean;
        createdAt?: string;
        updatedAt?: string;
    }

    interface Status {
        name: string;
        color: string;
        todos?: Task[];
        Edit?: boolean;
    }

    interface List {
        name: string;
        todos?: Task[];
        id?: string;
        image?: string;
        listType: ListType;
        icon?: string;
        githubRepo?: string;
        defaultView?: View;
    }

    interface listsState {
        lists: List[];
        currentList: List;
        newList: List;
        currentTodo: Task;
        todos?: Task[];
        todaysTodos: Task[];
        overdueTodos: Task[];
        view: ViewType;
        newTodo: Task;
    }

    interface Settings {
        statuses: Status[];
    }

    export interface PwaInjection {
        /**
         * @deprecated use `isPWAInstalled` instead
         */
        isInstalled: boolean;
        /**
         * From version v0.3.5+.
         */
        isPWAInstalled: Ref<boolean>;
        showInstallPrompt: Ref<boolean>;
        cancelInstall: () => void;
        install: () => Promise<void>;
        swActivated: Ref<boolean>;
        registrationError: Ref<boolean>;
        offlineReady: Ref<boolean>;
        needRefresh: Ref<boolean>;
        updateServiceWorker: (reloadPage?: boolean | undefined) => Promise<void>;
        cancelPrompt: () => Promise<void>;
        getSWRegistration: () => ServiceWorkerRegistration | undefined;
    }

    export interface PendingChange {
        id: string | number;
        action: string;
        endpoint: string;
        method: string;
        data: any;
        timestamp: number;
        synced: boolean;
        retryCount: number;
        syncedAt?: number;
        tempId?: string;
        listId?: string;
        todoId?: string;
        optimisticUpdate?: OptimisticUpdate;
    }

    export interface OptimisticUpdate {
        type: 'list' | 'todo' | 'delete_list' | 'delete_todo';
        tempId?: string;
        id?: string;
        listId?: string;
        todoId?: string;
        list?: any;
        todo?: any;
        index?: number;
        updates?: any;
    }

    declare module '#app' {
        interface NuxtApp {
            $pwa: UnwrapNestedRefs<PwaInjection>;
        }
    }
}
