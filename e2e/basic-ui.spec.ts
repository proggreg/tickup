import { test, expect } from '@playwright/test'

test('Homepage loads and shows main UI elements', async ({ page }) => {
  await page.goto('/')

  // Check the title
  await expect(page).toHaveTitle(/TickUp/)

  // Check for a Vuetify card (main container)
  const card = page.locator('.v-card')
  await expect(card.first()).toBeVisible()

  // Check for a button (e.g., add, save, or any main action)
  const button = page.locator('button, .v-btn')
  await expect(button.first()).toBeVisible()
}) 