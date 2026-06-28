import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import { createTodo } from "../helpers/todos";
import { createList } from "../helpers/lists";

test.describe("Todos", () => {
  test("should create a todo without a list", async ({ request }) => {
    const testId = uuidv4();

    const todoName = `Todo in a list ${testId}`;
    const todo = await createTodo(request, {
      name: todoName,
    });

    expect(todo).toBeTruthy();
    expect(todo.id).toBeTruthy();
  });

  test("should create a todo within a list", async ({ request }) => {
    const testId = uuidv4();

    const list = await createList(request, {
      name: `Test List ${testId}`,
    });

    const todoName = `Todo in a list ${testId}`;
    const todo = await createTodo(request, {
      name: todoName,
      listId: list.id,
    });

    expect(todo).toBeTruthy();
    expect(todo.id).toBeTruthy();
  });

  test("should default status to open if no status is given", async ({
    request,
  }) => {
    const testId = uuidv4();

    const todoName = `Todo without a status ${testId}`;
    const todo = await createTodo(request, {
      name: todoName,
    });

    expect(todo).toBeTruthy();
    expect(todo.id).toBeTruthy();
    expect(todo.status).toEqual("Open");
  });

  test("should return correct fields matching input", async ({ request }) => {
    const testId = uuidv4();
    const list = await createList(request, { name: `Test List ${testId}` });
    const todoName = `Field check todo ${testId}`;

    const todo = await createTodo(request, {
      name: todoName,
      listId: list.id,
    });

    expect(todo.name).toEqual(todoName);
    expect(todo.listId).toEqual(list.id);
    expect(todo.status).toEqual("Open");
    expect(todo.id).toBeTruthy();
  });

  test("should create a todo with explicit status", async ({ request }) => {
    const testId = uuidv4();

    const todo = await createTodo(request, {
      name: `Done todo ${testId}`,
      status: "Done",
    });

    expect(todo.id).toBeTruthy();
    expect(todo.status).toEqual("Done");
  });

  test("should create a todo with a due date", async ({ request }) => {
    const testId = uuidv4();
    const dueDate = new Date("2026-12-31");

    const todo = await createTodo(request, {
      name: `Todo with due date ${testId}`,
      dueDate,
    });

    expect(todo.id).toBeTruthy();
    expect(new Date(todo.dueDate).toDateString()).toEqual(
      dueDate.toDateString(),
    );
  });

  test("should create a subtask with valid parentId", async ({ request }) => {
    const testId = uuidv4();

    const parent = await createTodo(request, {
      name: `Parent todo ${testId}`,
    });

    const subtask = await createTodo(request, {
      name: `Subtask ${testId}`,
      parentId: parent.id,
    });

    expect(subtask.id).toBeTruthy();
    expect(subtask.parentId).toEqual(parent.id);
  });

  test("should return 400 when parentId does not exist", async ({
    request,
  }) => {
    const testId = uuidv4();

    const response = await request.post("/api/todo", {
      data: {
        name: `Orphan subtask ${testId}`,
        status: "",
        desc: "",
        edit: false,
        color: "#87909e",
        links: [],
        attachments: [],
        priorityLev: "",
        parentId: uuidv4(),
      },
    });

    expect(response.status()).toEqual(400);
  });
});
