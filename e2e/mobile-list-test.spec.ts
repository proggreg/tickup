import { test, expect } from '@playwright/test'

const TEST_USER = {
  username: 'testuser',
  password: 'testpassword123',
  email: 'test@example.com'
}

test.describe('Mobile List', () => {
  test('Record login journey with video', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/TickUp/)
    await expect(page.locator('text=Login')).toBeVisible()
    await page.locator('input').nth(0).fill(TEST_USER.username)
    await page.locator('input').nth(1).fill(TEST_USER.password)
    await page.click('button:has-text("Login")')
    await page.waitForTimeout(3000)
    await page.screenshot({ path: 'login-result.png' })
    if (!page.url().includes('/login')) {
      await page.waitForTimeout(2000)
      await page.screenshot({ path: 'after-login-success.png' })


    } else {
      const errorMessage = page.locator('text=Incorrect Credentials')
      await expect(errorMessage).toBeVisible()
    }
  })

  test('Show List', async ({ page, isMobile, viewport }) => {
    await page.goto('/lists')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('.v-list-item-title')
    
    if (viewport && viewport.width < 500) {
      const listItemTitle = await page.locator('.v-list-item-title').first()
      expect(listItemTitle).toBeVisible()

    }
    console.log('isMobile', isMobile)
  })
}) 