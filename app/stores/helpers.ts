/** Returns a blank `List` object suitable for initialising the new-list form. */
export const createNewListState = (): List => ({
    name: '',
    todos: [],
    icon: 'mdi-format-list-bulleted',
    listType: 'simple',
});

/** Returns a blank `Todo` object suitable for initialising the new-todo form. */
export const createNewTodoState = (): Todo => ({
    name: '',
    status: 'Open',
    desc: '',
    edit: false,
    color: '#87909e',
    links: [],
    attachments: [],
    priorityLev: '',
});
