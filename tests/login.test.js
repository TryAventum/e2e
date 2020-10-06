import { login } from '../helpers/auth/login'
import Page from '../helpers/builder'

let page

beforeAll(async () => {
  page = await Page.build()
})

afterAll(async () => {
  await page.close()
})

test('should log in', async () => {
  const isLoggedIn = await login(page)

  // Make sure that we logged in successfully
  expect(isLoggedIn).toBe(true)
})
