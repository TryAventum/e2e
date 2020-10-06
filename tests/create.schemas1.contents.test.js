import ContentHelpers from '../helpers/content'
import Page from '../helpers/builder'
import { login } from '../helpers/auth/login'
const schemas1 = require('../schemas/schemas1.json')
const conditionalLogic = require('../schemas/conditional-logic.json')

const contents = [schemas1]

let page

beforeAll(async () => {
  page = await Page.build()

  const isLoggedIn = await login(page)

  // Make sure that we logged in successfully
  expect(isLoggedIn).toBe(true)
})

test('should create schema1 items', async () => {
  for (const content of contents) {
    await page.goto(`http://localhost:3333/contents/${content.name}/new`, {
      waitUntil: 'networkidle2',
    })

    const schema1sToCreate = Number(process.env.SCHEMA1_TO_CREATE)

    for (let i = 1; i <= schema1sToCreate; i++) {
      await ContentHelpers.valuesSetter({
        fields: content.fields,
        page,
        conditionalLogic,
      })

      await page.click('[data-testid-button-id="save"]')

      if (i < schema1sToCreate) {
        await page.reload({
          waitUntil: 'networkidle2',
        })
      }
    }
  }
})

afterAll(async () => {
  // await page.waitFor(10000)
  await page.close()
})
