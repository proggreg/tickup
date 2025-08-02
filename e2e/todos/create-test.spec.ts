import { test, expect, } from '@playwright/test'


test.describe('Create Todo', () => {
  test('in a list', async ({ page }) => {
    await page.goto('/list/688e2e5d0ecb2728667ebe40')
    await page.waitForLoadState('networkidle')    
    const newTodoInput = await page.getByPlaceholder('Add todo to Todo List')
    const testId = new Date()
    const todoName = `New Todo test ${testId}`
    await newTodoInput.fill(todoName)
    await newTodoInput.press('Enter')
    await page.waitForLoadState('networkidle')
    const listItemTitlesEls = await page.getByTestId('todo-title').all()
    const listItemTitles = await Promise.all(listItemTitlesEls.map(navItem => navItem.textContent()))
  
    expect(listItemTitles.includes(todoName)).toBeTruthy()
  })

  test('in a table', async ({ page }) => {
    await page.goto('/list/688e660a9f3371ad3648103a')
    await page.waitForLoadState('networkidle')    
    const newTodoInput = await page.getByPlaceholder('Add todo to Table Todos')
    const testId = new Date()
    const todoName = `New Todo test ${testId}`
    await newTodoInput.fill(todoName)
    await newTodoInput.press('Enter')
    await page.waitForLoadState('networkidle')
    const listItemTitlesEls = await page.getByTestId('todo-title').all()
    const listItemTitles = await Promise.all(listItemTitlesEls.map(navItem => navItem.textContent()))
  
    expect(listItemTitles.includes(todoName)).toBeTruthy()
  })
})