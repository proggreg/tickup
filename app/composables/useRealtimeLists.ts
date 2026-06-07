import type { WsListEvent } from '~~/server/routes/ws/lists';

function snakeToCamelList(row: Record<string, unknown>): List {
    return {
        id: row.id,
        name: row.name,
        userId: row.user_id ?? row.userId,
        githubRepo: row.github_repo ?? row.githubRepo,
        listType: row.list_type ?? row.listType,
        defaultView: row.default_view ?? row.defaultView,
        createdAt: row.created_at ?? row.createdAt,
        updatedAt: row.updated_at ?? row.updatedAt,
    } as unknown as List;
}

export function useRealtimeLists() {
    const store = useListsStore();
    const { data } = useWebSocket('/ws/lists', {
        autoReconnect: { retries: 5, delay: 2000 },
        heartbeat: true,
    });

    watch(data, (raw: string | null) => {
        if (!raw) return;
        let event: WsListEvent;
        try {
            event = JSON.parse(raw) as WsListEvent;
        } catch {
            return;
        }

        const { type, payload } = event;

        if (type === 'todo:created') {
            const todo = payload as unknown as Task;
            const listId = todo.listId;
            const list = store.lists.find((l) => l.id === listId);
            if (list?.todos && !list.todos.find((t) => t.id === todo.id)) {
                list.todos.push(todo);
            }
            if (
                store.currentList?.id === listId &&
                !store.currentList.todos?.find((t) => t.id === todo.id)
            ) {
                store.currentList.todos = [...(store.currentList.todos ?? []), todo];
            }
        } else if (type === 'todo:updated') {
            const updated = payload as unknown as Task;
            const applyUpdate = (todos: Task[]) => {
                const idx = todos.findIndex((t) => t.id === updated.id);
                if (idx !== -1) Object.assign(todos[idx], updated);
            };
            store.lists.forEach((l) => l.todos && applyUpdate(l.todos));
            if (store.currentList?.todos) applyUpdate(store.currentList.todos);
            applyUpdate(store.todaysTodos);
            applyUpdate(store.overdueTodos);
            applyUpdate(store.recentTodos);
        } else if (type === 'todo:deleted') {
            const { id } = payload as { id: number | string };
            const idStr = String(id);
            const removeById = (todos: Task[]) => todos.filter((t) => t.id !== idStr);
            store.lists.forEach((l) => {
                if (l.todos) l.todos = removeById(l.todos);
            });
            if (store.currentList?.todos)
                store.currentList.todos = removeById(store.currentList.todos);
            store.todaysTodos = removeById(store.todaysTodos);
            store.overdueTodos = removeById(store.overdueTodos);
            store.recentTodos = removeById(store.recentTodos);
        } else if (type === 'list:created') {
            const list = snakeToCamelList(payload);
            if (!store.lists.find((l) => l.id === list.id)) {
                store.lists.push(list);
            }
        } else if (type === 'list:updated') {
            const updated = snakeToCamelList(payload);
            const idx = store.lists.findIndex((l) => l.id === updated.id);
            if (idx !== -1) Object.assign(store.lists[idx], updated);
            if (store.currentList?.id === updated.id) Object.assign(store.currentList, updated);
        } else if (type === 'list:deleted') {
            const { id } = payload as { id: string };
            store.lists = store.lists.filter((l) => l.id !== id);
        }
    });
}
