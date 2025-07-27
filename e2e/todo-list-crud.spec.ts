import { test, expect } from '@playwright/test'

const testHeader = { 'x-test-mode': 'true' }

// Test data
const testTodo = {
  name: 'Test Todo',
  userId: 'test-user',
  listId: 'test-list',
  status: 'todo',
  desc: 'A test todo',
  order: 1,
}
const testList = {
  name: 'Test List',
  userId: 'test-user',
}

test.describe('Todo CRUD', () => {
  test('create todo', async ({ request }) => {
    const response = await request.post('/api/todo', {
      data: testTodo,
      headers: testHeader,
    })
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.name).toBe(testTodo.name)
  })

  test('read todo', async ({ request }) => {
    // First create a todo
    const createResponse = await request.post('/api/todo', {
      data: testTodo,
      headers: testHeader,
    })
    const createdTodo = await createResponse.json()
    const todoId = createdTodo._id

    // Then read it
    const response = await request.get(`/api/todo/${todoId}`, {
      headers: testHeader,
    })
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data._id).toBe(todoId)
    expect(data.name).toBe(testTodo.name)
  })

  test('update todo', async ({ request }) => {
    // First create a todo
    const createResponse = await request.post('/api/todo', {
      data: testTodo,
      headers: testHeader,
    })
    const createdTodo = await createResponse.json()
    const todoId = createdTodo._id

    // Then update it
    const response = await request.put(`/api/todo/${todoId}`, {
      data: { ...testTodo, name: 'Updated Todo' },
      headers: testHeader,
    })
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.name).toBe('Updated Todo')
  })

  test('delete todo', async ({ request }) => {
    // First create a todo
    const createResponse = await request.post('/api/todo', {
      data: testTodo,
      headers: testHeader,
    })
    const createdTodo = await createResponse.json()
    const todoId = createdTodo._id

    // Then delete it
    const response = await request.delete(`/api/todo/${todoId}`, {
      headers: testHeader,
    })
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data._id).toBe(todoId)
  })
})

test.describe('List CRUD', () => {
  test('create list', async ({ request }) => {
    const response = await request.post('/api/list/create', {
      data: testList,
      headers: testHeader,
    })
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.name).toBe(testList.name)
  })

  test('read list', async ({ request }) => {
    // First create a list
    const createResponse = await request.post('/api/list/create', {
      data: testList,
      headers: testHeader,
    })
    const createdList = await createResponse.json()
    const listId = createdList._id

    // Then read it
    const response = await request.get(`/api/list/${listId}`, {
      headers: testHeader,
    })
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data._id).toBe(listId)
    expect(data.name).toBe(testList.name)
  })

  test('update list', async ({ request }) => {
    // First create a list
    const createResponse = await request.post('/api/list/create', {
      data: testList,
      headers: testHeader,
    })
    const createdList = await createResponse.json()
    const listId = createdList._id

    // Then update it
    const response = await request.put(`/api/list/${listId}`, {
      data: { ...testList, name: 'Updated List' },
      headers: testHeader,
    })
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.name).toBe('Updated List')
  })

  test('delete list', async ({ request }) => {
    // First create a list
    const createResponse = await request.post('/api/list/create', {
      data: testList,
      headers: testHeader,
    })
    const createdList = await createResponse.json()
    const listId = createdList._id

    // Then delete it
    const response = await request.delete(`/api/list/${listId}`, {
      headers: testHeader,
    })
    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data._id).toBe(listId)
  })
}) 