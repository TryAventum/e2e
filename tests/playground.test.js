import Page from '../helpers/builder'
import { login } from '../helpers/auth/login'
const pull = require('lodash/pull')
const random = require('lodash/random')
const sampleSize = require('lodash/sampleSize')
const sample = require('lodash/sample')

let page

beforeAll(async () => {
  page = await Page.build()

  const isLoggedIn = await login(page)

  // Make sure that we logged in successfully
  expect(isLoggedIn).toBe(true)
})

test('playground', async () => {
  await page.goto('http://localhost:3333/contents/schemas1/new', {
    waitUntil: 'networkidle2'
  })

  // const repeatable = true

  // const optionsToSelect = ['One', 'Three']

  const selector = '[data-testid-name="bool"] input'

  // const toggleBtnSelector = `${selector} button`

  // Open the dropdown
  const checkbox = await page.$(selector)
  // await page.click(selector)

  const isChecked = await (await checkbox.getProperty('checked')).jsonValue()

  if (isChecked) {

  }

  await checkbox.click()

  // Get the selected options
  // const selectedOptions = await page.$$(`${selector} .options .selected`)

  // Unselect the selected options
  // if (selectedOptions) {
  //   for (const option of selectedOptions) {
  //     await option.click()
  //   }
  // }

  // Get all options
  // const allDropdownOptions = await page.$$(`${selector} .options>div`)

  // for (const option of allDropdownOptions) {
  //   const optionLabel = await page.evaluate(el => el.querySelector('.option-label').innerHTML, option)
  //   if (optionsToSelect.includes(optionLabel.trim())) {
  //     await option.click()
  //   }
  // }

  // If not repeatable then the dropdown will automatically closed when selecting the item
  // if (repeatable) {
  // Close the dropdown menu
  // await page.click(toggleBtnSelector)
  // }

  // await page.click('[data-testid-name="repSelect"] button')

  // const dropdownHandle = await page.evaluateHandle(
  //   () => {
  //     const reqFields = document.querySelector(
  //       '[data-testid-name="repSelect"]'
  //     )

  //     return reqFields
  //   }
  // )

  // const options = await page.evaluateHandle(
  //   (_dropDownHandle) => {
  //     const reqFields = _dropDownHandle.querySelectorAll(
  //       '.options>div'
  //     )

  //     return reqFields
  //   },
  //   dropdownHandle
  // )

  // const options = await page.$$eval(null, (sel, _dropDownHandle) => {
  //   const reqFields = _dropDownHandle.querySelectorAll(
  //     '.options>div'
  //   )

  //   console.log(reqFields)

  //   return reqFields
  // }, dropdownHandle)
  // const options = await page.$$('[data-testid-name="repSelect"] .options>div')

  // if (options) {
  //   for (const option of options) {
  //     await option.click()
  //   }
  // }

  // console.log(options.length)
})

afterAll(async () => {
  // await page.waitFor(10000)
  // await page.close()
})
