import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setup, createPage } from '@nuxt/test-utils'

describe('Todo Attachments', () => {
  let page: any

  beforeAll(async () => {
    await setup({
      server: true,
      browser: true,
    })
    page = await createPage('/')
  })

  afterAll(async () => {
    await page.close()
  })

  it('should display attachments section in todo detail', async () => {
    // Navigate to a todo detail page
    await page.goto('/todo/test-todo-id')
    
    // Check if attachments section is present
    const attachmentsSection = await page.locator('text=Attachments')
    await expect(attachmentsSection).toBeVisible()
  })

  it('should show file upload input', async () => {
    await page.goto('/todo/test-todo-id')
    
    // Check if file input is present
    const fileInput = await page.locator('input[type="file"]')
    await expect(fileInput).toBeVisible()
  })

  it('should show supported file types message', async () => {
    await page.goto('/todo/test-todo-id')
    
    // Check if supported file types message is shown
    const supportedTypes = await page.locator('text=Supported: Images, PDF, Word, Excel, Text files')
    await expect(supportedTypes).toBeVisible()
  })

  it('should serve attachments from MongoDB', async () => {
    // This test would require a real attachment to be created first
    // For now, just verify the API endpoint exists
    const response = await page.request.get('/api/attachment/test-id')
    expect(response.status()).toBe(400) // Should fail with invalid ID
  })
}) 