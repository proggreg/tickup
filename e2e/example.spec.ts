import { test, expect } from '@playwright/test'

test('Homepage has title', async ({ page }) => {
  await page.goto('/')

  console.log('page', page)

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/TickUp/)
})
