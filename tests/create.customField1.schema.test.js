import Page from '../helpers/builder'
import { login } from '../helpers/auth/login'
const customField1 = require('../schemas/customField1.json')
const helpers = require('../helpers/schemaCustomFields')
const conditionalLogic = require('../schemas/conditional-logic.json')
const {
  checkCheckboxFieldSettings
} = require('../helpers/shared')

const customFields = [customField1]

let page

beforeAll(async () => {
  page = await Page.build()

  const isLoggedIn = await login(page)

  // Make sure that we logged in successfully
  expect(isLoggedIn).toBe(true)
})

test('should create custom field 1', async () => {
  for (const customField of customFields) {
    /**
     * Create the custom field or the schema
     */
    await page.goto('http://localhost:3333/fields/new', {
      waitUntil: 'networkidle2'
    })
    await page.type('#theTitle', customField.title)
    await page.type('#singularTitle', customField.singularTitle)
    await page.type('#name', customField.name)

    let index = 0
    for (const field of customField.fields) {
      // Add field
      await page.evaluate(sel => document.querySelector(sel).click(), `#${helpers.getButtonId(field)}`)

      await helpers[field.type]({ field, index, page })

      index++
    }
  }
})

test('setup the conditional logic', async () => {
  for (const customField of customFields) {
    let index = 0
    for (const field of customField.fields) {
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
            fields: customField.fields,
            page
          })
        }
      }

      index++
    }
  }
})

test('should save the schema', async () => {
  // I used this method to click on the element because I faced issue like https://stackoverflow.com/a/50032302/3263601
  await page.evaluate(sel => document.querySelector(sel).click(), '[data-testid-button-id="save"]')
})

afterAll(async () => {
  // await page.waitFor(10000)
  await page.close()
})
