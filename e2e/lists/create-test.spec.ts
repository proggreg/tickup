import { test, expect, } from '@playwright/test'


test.describe('Create List', () => {
  test('from the nav', async ({ page, isMobile }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    if (!isMobile) {
        await page.getByTestId('new-list-button').click()
        const newListInput = await page.getByPlaceholder('New List')
        const now = new Date().toUTCString()
        const listName = `List Name ${now}`
        await newListInput.fill(listName)
        await newListInput.press('Enter')
        await page.waitForLoadState('networkidle')  
        const listElTitle = await page.getByTestId('list-title').locator('input').inputValue()
        console.log('listElTitle', listElTitle)
         expect(listElTitle).toBe(listName)
    }    
  })

})