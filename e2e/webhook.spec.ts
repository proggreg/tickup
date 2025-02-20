import { test, expect } from '@playwright/test'

test('webhook endpoint returns correct user', async ({ request }) => {
    const response = await request.get('/api/webhook')
    expect(response.status()).toBe(200)
    const userData = await response.json()
    console.log('userData', userData)
})
