import { test, expect } from '@playwright/test'


test.describe('Create Todo', () => {
  test('create todo in a list', async ({ page }) => {
    const todoListName = 'Todo List'
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const navItems = await page.locator('.v-list-item-title').all()
    const listNames = await Promise.all(navItems.map(navItem => navItem.textContent()))
    
    if (!listNames.includes(todoListName)) {
      await page.getByTestId('new-list-button').click()
      await page.getByPlaceholder('New List').fill(todoListName)
      await page.keyboard.press('Enter')
      
    } else {

      // TODO don't use listid for nav
      await page.goto('/list/688e2e5d0ecb2728667ebe40')
      const newTodoInput = await page.getByPlaceholder('Add todo to Todo List')
      const testId = new Date()
      const todoName = `New Todo test ${testId}`
      await newTodoInput.fill(todoName)
      await newTodoInput.press('Enter')
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: 'newtodo.png'})

      const listItemTitlesEls = await page.locator('.v-list-item-title').all()
      const listItemTitles = await Promise.all(listItemTitlesEls.map(navItem => navItem.textContent()))
  
      expect(listItemTitles.includes(todoName)).toBeTruthy()
    }
  })
})