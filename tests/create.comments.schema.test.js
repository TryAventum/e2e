import Page from '../helpers/builder'
import { login } from '../helpers/auth/login'
const conditionalLogic = require('../schemas/conditional-logic.json')
const comments = require('../schemas/comments.json')
const helpers = require('../helpers/schemaCustomFields')
const {
  checkCheckboxFieldSettings
} = require('../helpers/shared')

const contents = [comments]

let page

beforeAll(async () => {
  page = await Page.build()

  const isLoggedIn = await login(page)

  // Make sure that we logged in successfully
  expect(isLoggedIn).toBe(true)
})

test('should create comments schema', async () => {
  for (const content of contents) {
    await page.goto('http://localhost:3333/schemas/new', {
      waitUntil: 'networkidle2'
    })

    await page.type('#theTitle', content.title, { delay: 1 })

    await page.type('#singularTitle', content.singularTitle, {
      delay: 1
    })

    await page.type('#name', content.name, { delay: 1 })

    if (content.icon) {
      await page.type('#icon', content.icon)
    }

    if (content.acl) {
    }

    let index = 0
    for (const field of content.fields) {
      // Add field
      await page.evaluate(sel => document.querySelector(sel).click(), `#${helpers.getButtonId(field)}`)

      await helpers[field.type]({ field, index, page })

      index++
    }
  }
})

test('setup the conditional logic', async () => {
  for (const content of contents) {
    let index = 0
    for (const field of content.fields) {
      const fieldConLog = conditionalLogic.find(f => f.name === field.name)
      if (fieldConLog) {
        field.conditionalLogic = fieldConLog.conditionalLogic

        if (field.conditionalLogic.enable) {
          await checkCheckboxFieldSettings({
            labelText: 'Conditional Logic',
            fieldOrder: index,
            page
          })
          await helpers.setConditionalLogicFieldSettingsValues({
            settings: field.conditionalLogic,
            fieldOrder: index,
            fields: content.fields,
            page
          })
        }
      }

      index++
    }
  }
})

test('should save the schema', async () => {
  const [saveBtn] = await page.$x("//button[contains(., 'Save')]")
  if (saveBtn) {
    await saveBtn.click()
  }
})

afterAll(async () => {
  // await page.waitFor(10000)
  await page.close()
})
