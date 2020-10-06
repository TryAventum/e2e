/**
 * create.schemas1.schema.and.contents.with.dynamic.conditional.logic.and.validations.tests
 */

import ContentHelpers from '../helpers/content'
import Page from '../helpers/builder'
import { login } from '../helpers/auth/login'
const schemas1 = require('./schemas/schemas1.json')
const conditionalLogic = require('../schemas/conditional-logic.json')
const helpers = require('../helpers/schemaCustomFields')
const {
  checkCheckboxFieldSettings
} = require('../helpers/shared')

const contents = [schemas1]

let page

beforeAll(async () => {
  page = await Page.build()

  const isLoggedIn = await login(page)

  // Make sure that we logged in successfully
  expect(isLoggedIn).toBe(true)
})

test('should create schemas1 schema', async () => {
  for (const content of contents) {
    /**
     * Create the custom field or the schema
     */
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

    // Save the data
    // const [saveBtn] = await page.$x("//button[contains(., 'Save')]")
    // if (saveBtn) {
    //   await saveBtn.click()
    // }
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

// test.only('should create dynamic conditional logic', async () => {
//   for (const content of contents) {
/**
     * Create the custom field or the schema
     */
// await page.goto(`http://localhost:3333/schemas/${content.name}/edit`, {
//   waitUntil: 'networkidle2'
// })

// EVERYTHING IS RANDOM!!

// Randomly pick 2 - 4 fields for example.

// For each field create random 1 - 3 conditional logic rules.

// For each rule randomly select the field and the values.

// STORE EVERYTHING!!!!

// let index = 0
// for (const field of content.fields) {

//   index++
// }
//   }
// })

test.only('should create schemas1 items', async () => {
  for (const content of contents) {
    await page.goto(`http://localhost:3333/contents/${content.name}/new`, {
      waitUntil: 'networkidle2'
    })

    await ContentHelpers.valuesSetter({ fields: content.fields, page, conditionalLogic })
  }
})

afterAll(async () => {
  // await page.waitFor(10000)
  // await page.close()
})
