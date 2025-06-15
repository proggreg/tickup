import { test, expect } from '@playwright/test'

async function authenticate(request) {
    return await request.post('/api/auth/signin', {
        data: {
            username: 'test',
            password: 'password',
        },
    })
}

test('github endpoint errors with no branch name', async ({ request }) => {
    const authResponse = await authenticate(request)
    console.log('authResponse', authResponse)
    const response = await request.get('/api/github')
    console.log('github response', response)

    expect(response.status()).toBe(200)

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
