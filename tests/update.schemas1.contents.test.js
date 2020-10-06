import ContentHelpers from '../helpers/content'
import Page from '../helpers/builder'
import { login } from '../helpers/auth/login'
import sample from 'lodash/sample'
const content = require('../schemas/schemas1.json')
const conditionalLogic = require('../schemas/conditional-logic.json')

let page

beforeAll(async () => {
  page = await Page.build()

  const isLoggedIn = await login(page)

  // Make sure that we logged in successfully
  expect(isLoggedIn).toBe(true)
})

test('should update random schema1 item', async () => {
  const schema1sToEdit = Number(process.env.SCHEMA1_TO_EDIT)

  for (let i = 1; i <= schema1sToEdit; i++) {
    await page.goto(`http://localhost:3333/contents/${content.name}/list`, {
      waitUntil: 'networkidle2',
    })

    // Get the edit content links
    const editContentLinks = await page.$$('.contents .edit-content')

    // Click on random link
    await sample(editContentLinks).click()
    // await page.waitForNavigation()
    await page.waitFor(3000)

    await ContentHelpers.valuesSetter({
      fields: content.fields,
      page,
      conditionalLogic,
    })

    await page.click('[data-testid-button-id="save"]')

    await page.waitForFunction(
      'document.querySelector(".notification-header-msg")'
    )
    const successMessage = await page.$eval(
      '.notification-header-msg',
      (el) => el.innerHTML
    )
    expect(successMessage).toEqual('Data saved successfully!')
  }
})

afterAll(async () => {
  // await page.waitFor(10000)
  await page.close()
})
