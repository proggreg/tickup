import { test, expect } from '@playwright/test'

test('Homepage has title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/TickUp/)
})
