import ContentHelpers from '../helpers/content'
import Page from '../helpers/builder'
import { login } from '../helpers/auth/login'
const post = require('../schemas/posts.json')
const conditionalLogic = require('../schemas/conditional-logic.json')

const contents = [post]

let page

beforeAll(async () => {
  page = await Page.build()

  const isLoggedIn = await login(page)

  // Make sure that we logged in successfully
  expect(isLoggedIn).toBe(true)
})

test('should create post items', async () => {
  for (const content of contents) {
    await page.goto(`http://localhost:3333/contents/${content.name}/new`, {
      waitUntil: 'networkidle2',
    })

    const postsToCreate = Number(process.env.POSTS_TO_CREATE)

    for (let i = 1; i <= postsToCreate; i++) {
      await ContentHelpers.valuesSetter({
        fields: content.fields,
        page,
        conditionalLogic,
      })

      await page.click('[data-testid-button-id="save"]')

      if (i < postsToCreate) {
        await page.reload({
          waitUntil: 'networkidle2',
        })
        // await page.waitFor(2000)
      }
    }
  }
})

afterAll(async () => {
  // await page.waitFor(10000)
  await page.close()
})
