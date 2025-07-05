import { chromium } from '@playwright/test'

const TEST_USER = {
  username: 'testuser',
  password: 'testpassword123',
  email: 'test@example.com'
}

const BASE_URL = 'http://localhost:3000'

async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  // Set test mode header
  await page.setExtraHTTPHeaders({
    'x-test-mode': 'true'
  })

  // Create test user via API
  const response = await page.request.post(`${BASE_URL}/api/auth/user`, {
    data: {
      username: TEST_USER.username,
      password: TEST_USER.password,
      email: TEST_USER.email
    }
  })

  if (response.status() === 200) {
    console.log('Test user created successfully')
  } else if (response.status() === 400) {
    const body = await response.text()
    if (body.includes('username taken')) {
      console.log('Test user already exists')
    } else {
      throw new Error(`Failed to create test user: ${body}`)
    }
  } else {
    throw new Error(`Failed to create test user: ${response.status()}`)
  }

  await browser.close()
}

export default globalSetup 