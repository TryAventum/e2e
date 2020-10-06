const pull = require('lodash/pull')
const random = require('lodash/random')
const sampleSize = require('lodash/sampleSize')
const sample = require('lodash/sample')
const indexOf = require('lodash/indexOf')

const checkCheckBox = async ({
  selector, // The checkbox field's wrapper selector
  check, // Should we check it or not
  page,
}) => {
  let checkboxField

  if (typeof selector === 'string') {
    checkboxField = await page.$(`${selector} input`)
  } else {
    checkboxField = selector
  }

  // Is this checkbox field checked
  const isChecked = await (
    await checkboxField.getProperty('checked')
  ).jsonValue()

  if (check && !isChecked) {
    await checkboxField.click()
  }
}

const selectDropdownOptions = async ({
  selector, // selector to .dropdown for example
  optionsToSelect,
  repeatable = false,
  page,
}) => {
  const toggleBtnSelector = `${selector} button`

  // Open the dropdown
  await page.click(toggleBtnSelector)

  // Get the selected options
  const selectedOptions = await page.$$(`${selector} .options .selected`)

  // Unselect the selected options
  if (selectedOptions.length) {
    for (const option of selectedOptions) {
      await option.click()
    }

    if (!repeatable) {
      await page.click(toggleBtnSelector)
    }
  }

  // Get all options
  const allDropdownOptions = await page.$$(`${selector} .options>div`)

  for (const option of allDropdownOptions) {
    const optionLabel = await page.evaluate(
      (el) => el.querySelector('.option-label').innerHTML,
      option
    )
    if (optionsToSelect.includes(optionLabel.trim())) {
      await option.click()
    }
  }

  // If not repeatable then the dropdown will automatically closed when selecting the item
  if (repeatable) {
    // Close the dropdown menu
    await page.click(toggleBtnSelector)
  }
}

const checkCheckboxFieldSettings = async ({
  labelText,
  fieldOrder,
  check = true,
  page,
}) => {
  const field = await page.evaluateHandle(
    (_fieldOrder, _labelText) => {
      const fieldList = document.querySelector('.fields').children[_fieldOrder]
      const labels = fieldList.querySelectorAll('label')

      let requiredLabel
      // const requiredLabel = labels.find((l) =>
      //   l.textContent.includes(_labelText)
      // )

      for (const lab of labels) {
        if (lab.textContent.includes(_labelText)) {
          requiredLabel = lab
          break
        }
      }

      const input = requiredLabel
        .closest('[data-testid-type="checkbox"]')
        .querySelector('input') // TODO test this, new stuff here

      return input
    },
    fieldOrder,
    labelText
  )

  await checkCheckBox({ selector: field, check, page })
}

/**
 * Opens a content section modal form and select items from it.
 * @param {string} operator supported values are "is", "is not", "contains", "does not contain",  and "random".
 * @param {Array} operator values that we have to select or avoid select.
 */
const selectContent = async ({
  // TODO wait until the item get selected
  page,
  modalBtn,
  field,
  operator = 'random',
  values = [],
}) => {
  const deselectAllHelper = async () => {
    const selectedItems = await page.$$(
      '.modal-content .contents .selected input'
    )

    // Unselect the selected items
    if (selectedItems.length) {
      await selectedItems[0].click()
    }

    if (selectedItems.length > 1) {
      await deselectAllHelper()
    }
  }
  const deselectAll = async () => {
    await deselectAllHelper()

    const isNextBtnDisabled =
      (await page.$(
        '.modal-content .pagination-bottom .-next button[disabled]'
      )) !== null
    if (!isNextBtnDisabled) {
      // We have a next page, navigate to it
      await page.click('.modal-content .pagination-bottom .-next button')

      // Wait for the contents to appear
      await page.waitForSelector('.modal-content .contents .rt-tr-group')

      await deselectAll()
    } else {
      // Navigate to page 1
      const pageJumpInput = await page.$(
        '.modal-content .pagination-bottom .-pageJump input'
      )

      await page.clearAndType({
        inputSelector: pageJumpInput,
        value: '1',
        pressEnter: true,
      })
    }
  }
  // Open the modal
  if (typeof modalBtn === 'string') {
    // In this case the modalBtn is a selector.
    await page.click(modalBtn)
  } else {
    await modalBtn.click()
  }

  // Wait for the contents to appear
  await page.waitForSelector('.modal-content .contents .rt-tr-group')

  await deselectAll()

  let currentPage = 1

  const valuesCopy = [...values]

  const selectValue = async () => {
    // Get all the values in the current page
    const tds = await page.$$eval(
      '.modal-content .rt-tr-group>.rt-tr>.rt-td:nth-child(2)>div',
      (sel) => sel.map((o) => o.textContent)
    )

    // If we have to select from the values
    if (['is', 'contains'].includes(operator)) {
      let index = 0
      for (const item of tds) {
        if (valuesCopy.includes(item)) {
          // Remove the item that we found from the valuesCopy array
          pull(valuesCopy, item)
          // Select the item
          await page.click(
            `.modal-content .contents>div:nth-child(${index + 1}) input`
          )
        }
        index++
      }
    }

    // If we have to select some extra items
    if (
      ['is not', 'contains', 'does not contain', 'random'].includes(operator)
    ) {
      // Remove the values.
      const tdsWithoutValues = tds.filter((t) => !values.includes(t))

      // Randomly select between 1 - 3 items if repeatable otherwise select one item
      const randomItems = field.repeatable
        ? sampleSize(tdsWithoutValues, random(1, 3))
        : [sample(tdsWithoutValues)]

      for (const item of randomItems) {
        // Select the item,  we get the index from the tds array, because these are the items that displayed on the page.
        await page.click(
          `.modal-content .contents>div:nth-child(${
            indexOf(tds, item) + 1
          }) input`
        )
      }
    }

    /**
     * If there are values that must be selected and we didn't find them in the current page
     * OR
     * If the operator equal to "random" and we are on the first page then navigate to a new page.
     */

    // If the operator === 'random' we are selecting random items from the first and second page.
    if (
      (valuesCopy.length && ['is', 'contains'].includes(operator)) ||
      (operator === 'random' && currentPage === 1 && field.repeatable)
    ) {
      // Navigate to a new page by clicking on the next button
      await page.click('.modal-content .pagination-bottom .-next button')
      // Wait for the contents to appear
      await page.waitForSelector('.modal-content .contents .rt-tr-group')

      currentPage++

      await selectValue()
    }
  }

  await selectValue()

  // Close the modal
  await page.click('.modal-actions button')

  // Wait for the modal to gone
  await page.waitForSelector('.modal-content .contents .panel', {
    hidden: true,
  })
}

const selectUploads = async ({
  // TODO wait until the item get selected
  page,
  modalBtn,
  field,
  operator = 'random',
  values = [],
}) => {
  const nextBtnSelector = '.modal-content .pagination button.next'

  const deselectAll = async () => {
    // Wait for the contents to appear
    await page.waitForSelector('.modal-content [data-testid-upload-name]')

    const selectedItems = await page.$$(
      '.modal-content [data-testid-is-selected-upload="true"] .selectBtn'
    )

    // Unselect the selected items
    if (selectedItems) {
      for (const option of selectedItems) {
        await option.click()
      }
    }

    const isNextBtnDisabled =
      (await page.$(`${nextBtnSelector}[disabled]`)) !== null
    if (!isNextBtnDisabled) {
      // We have a next page, navigate to it
      await page.click(`${nextBtnSelector}`)

      await deselectAll()
    } else {
      // Navigate to page 1
      await page.click('.modal-content .pagination .firstItem')

      // Wait for the contents to appear
      await page.waitForSelector('.modal-content [data-testid-upload-name]')
    }
  }
  // Open the modal
  if (typeof modalBtn === 'string') {
    // In this case the modalBtn is a selector.
    await page.click(modalBtn)
  } else {
    await modalBtn.click()
  }

  // Wait for the contents to appear
  await page.waitForSelector('.modal-content [data-testid-upload-name]')

  await deselectAll()

  let currentPage = 1

  const valuesCopy = [...values]

  const selectValue = async () => {
    // Get all the values in the current page
    const valuesOnThePage = await page.$$eval(
      '[data-testid-upload-name]',
      (sel) => sel.map((o) => o.getAttribute('data-testid-upload-name'))
    )

    // If we have to select from the values
    if (['is', 'contains'].includes(operator)) {
      for (const item of valuesOnThePage) {
        if (valuesCopy.includes(item)) {
          // Remove the item that we found from the valuesCopy array
          pull(valuesCopy, item)
          // Select the item
          await page.click(`[data-testid-upload-name="${item}"] .selectBtn`)
        }
      }
    }

    // If we have to select some extra items
    if (
      ['is not', 'contains', 'does not contain', 'random'].includes(operator)
    ) {
      // Remove the values.
      const tdsWithoutValues = valuesOnThePage.filter(
        (t) => !values.includes(t)
      )

      // Randomly select between 1 - 3 items if repeatable otherwise select one item
      const randomItems = field.repeatable
        ? sampleSize(tdsWithoutValues, random(1, 3))
        : [sample(tdsWithoutValues)]

      for (const item of randomItems) {
        // Select the item,  we get the index from the valuesOnThePage array, because these are the items that displayed on the page.
        await page.click(`[data-testid-upload-name="${item}"] .selectBtn`)
      }
    }

    /**
     * If there are values that must be selected and we didn't find them in the current page
     * OR
     * If the operator equal to "random" and we are on the first page then navigate to a new page.
     */

    // If the operator === 'random' we are selecting random items from the first and second page.
    if (
      (valuesCopy.length && ['is', 'contains'].includes(operator)) ||
      (operator === 'random' && currentPage === 1 && field.repeatable)
    ) {
      // Navigate to a new page by clicking on the next button
      await page.click(nextBtnSelector)
      // Wait for the contents to appear
      await page.waitForSelector('.modal-content [data-testid-upload-name]')

      currentPage++

      await selectValue()
    }
  }

  await selectValue()

  // Close the modal
  await page.click('.modal-actions button')

  // Wait for the modal to gone
  await page.waitForSelector('.modal-content .panel', {
    hidden: true,
  })
}

module.exports = {
  checkCheckboxFieldSettings,
  selectDropdownOptions,
  checkCheckBox,
  selectContent,
  selectUploads,
}
