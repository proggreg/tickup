/**
 * Composable for common todo actions
 * Provides reusable logic for todo selection, status changes, etc.
 */
export const useTodoActions = () => {
    const listsStore = useListsStore();

    const selectTodo = (todo: Task) => {
        listsStore.setCurrentTodo(todo);
        navigateTo(`/todo/${todo.id}`);
    };

    const setTodoStatus = async (todo: Task, status: 'Open' | 'Closed', delay = 0) => {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                todo.status = status;
                listsStore.updateTodo(todo);
                resolve();
            }, delay);
        });
    };

    const setClosed = (todo: Task, delay = 0) => {
        return setTodoStatus(todo, 'Closed', delay);
    };

    const setOpen = (todo: Task, delay = 0) => {
        return setTodoStatus(todo, 'Open', delay);
    };

    const formatDate = (date: Date | string | undefined): string => {
        if (!date) {
            return '';
        }
        return new Date(date).toLocaleDateString('en-GB');
    };

    return {
        selectTodo,
        setClosed,
        setOpen,
        setTodoStatus,
        formatDate,
    };
};
