import { test, expect } from '@playwright/test'

test('github endpoint errors with no branch name', async ({ request }) => {
    const response = await request.get('/api/github')
    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data.message).toBe('Missing branchName in query parameters')
})

test('github endpoint returns 404 when branch name is provided', async ({ request }) => {
    const response = await request.get('/api/github', { params: { branchName: 'here' } })
    expect(response.status()).toBe(404)
})

test('github endpoint returns 200 when branch name is provided', async ({ request }) => {
    const response = await request.get('/api/github', { params: { branchName: 'main' } })
    expect(response.status()).toBe(200)
})
