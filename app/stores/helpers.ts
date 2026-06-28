export const createNewListState = (): List => ({
  name: "",
  todos: [],
  icon: "mdi-format-list-bulleted",
  listType: "simple",
});

export const createNewTodoState = (): Todo => ({
  name: "",
  status: "",
  desc: "",
  edit: false,
  color: "#87909e",
  links: [],
  attachments: [],
  priorityLev: "",
});
