export {Todo, Status, List}
declare global {
  interface Todo {
    name: string;
    _id: string | undefined;
    dueDate?: Date,
    listId?: string;
    status: string;
    desc?: string;
  }

  interface Status {
    name: string;
    color: string;
  }

  interface List {
    name: string;
    todos: Todo[];
    _id?: string;
  }
}
