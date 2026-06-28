import { test, expect } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import { createTodo } from "../helpers/todos";

test.describe("Update a todo", () => {
  test("should update a todo name", async ({ request }) => {
    const testId = uuidv4();
    const created = await createTodo(request, {
      name: `Original ${testId}`,
      dueDate: new Date(),
    });

    expect(created.id).toBeTruthy();

    const response = await request.put(`/api/todo/${created.id}`, {
      data: { ...created, name: `Updated ${testId}` },
    });

    expect(response.status()).toEqual(200);

    const updated = await response.json();
    expect(updated.name).toEqual(`Updated ${testId}`);
    expect(updated.id).toEqual(created.id);
  });

  test("should update a todo status", async ({ request }) => {
    const testId = uuidv4();
    const created = await createTodo(request, {
      name: `Status Todo ${testId}`,
      dueDate: new Date(),
    });

    expect(created.id).toBeTruthy();
    expect(created.status).toEqual("Open");

    const response = await request.put(`/api/todo/${created.id}`, {
      data: { ...created, status: "Done" },
    });

    expect(response.status()).toEqual(200);

    const updated = await response.json();
    expect(updated.status).toEqual("Done");
    expect(updated.id).toEqual(created.id);
  });

  test("should return 500 when updating a todo that does not exist", async ({
    request,
  }) => {
    const nonExistentId = uuidv4();
    const response = await request.put(`/api/todo/${nonExistentId}`, {
      data: {
        name: "Ghost Todo",
        status: "Open",
        desc: "",
        color: "#87909e",
        priorityLev: "",
        links: [],
        attachments: [],
      },
    });

    expect(response.status()).toEqual(500);
  });

  test("should persist updated fields after a subsequent fetch", async ({
    request,
  }) => {
    const testId = uuidv4();
    const created = await createTodo(request, {
      name: `Persist Check ${testId}`,
      dueDate: new Date(),
    });

    expect(created.id).toBeTruthy();

    const putResponse = await request.put(`/api/todo/${created.id}`, {
      data: { ...created, name: `Persisted ${testId}`, status: "In Progress" },
    });

    expect(putResponse.status()).toEqual(200);

    const getResponse = await request.get(`/api/todo/${created.id}`);
    expect(getResponse.status()).toEqual(200);

    const fetched = await getResponse.json();
    expect(fetched.name).toEqual(`Persisted ${testId}`);
    expect(fetched.status).toEqual("In Progress");
  });
});
