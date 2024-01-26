export { Todo, Status, List }
declare global {
  interface Todo {
    userId: string | undefined;
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
    userId?: string;
    name: string;
    todos: Todo[];
    _id?: string;
  }
}
