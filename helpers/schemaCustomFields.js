const {
  selectDropdownOptions,
  selectContent,
  checkCheckBox,
  selectUploads
} = require('./shared')

const getButtonId = (field) => {
  let btnText
  switch (field.type) {
    default:
      btnText = field.type
      break

    case 'custom':
      btnText = field.name
      break
  }

  return btnText
}

const setConditionalLogicFieldSettingsValues = async ({
  settings,
  fieldOrder,
  fields,
  page
}) => {
  const conditionalLogicSelector = `.fields>div:nth-child(${fieldOrder + 1}) .conditional-logic`

  await page.waitForSelector(conditionalLogicSelector)

  const actionTypeDropdownSelector = `${conditionalLogicSelector} .dropdown:nth-of-type(1)`

  await selectDropdownOptions({
    selector: actionTypeDropdownSelector,
    optionsToSelect: [settings.actionType],
    page
  })

  const logicTypeDropdownSelector = `${conditionalLogicSelector} .dropdown:nth-of-type(2)`

  await selectDropdownOptions({
    selector: logicTypeDropdownSelector,
    optionsToSelect: [settings.logicType],
    page
  })

  let index = 2
  for (const rule of settings.rules) {
    const ruleWrapperSelector = `${conditionalLogicSelector}>div:nth-child(${index})`
    const selectFieldDropdownSelector = `${ruleWrapperSelector} [data-testid-dropdown-placeholder="Select Field"]`

    await selectDropdownOptions({
      selector: selectFieldDropdownSelector,
      optionsToSelect: [rule.field],
      page
    })

    if (rule.logicType) {
      const logicTypeDropdownSelector = `${ruleWrapperSelector} [data-testid-dropdown-placeholder="Logic Type"]`
      await page.waitForSelector(logicTypeDropdownSelector)

      await selectDropdownOptions({
        selector: logicTypeDropdownSelector,
        optionsToSelect: [rule.logicType],
        page
      })
    }

    const operatorDropdownSelector = `${ruleWrapperSelector} [data-testid-dropdown-placeholder="Operator"]`

    await selectDropdownOptions({
      selector: operatorDropdownSelector,
      optionsToSelect: [rule.operator],
      page
    })

    // Get the field that this rule depends on
    const depField = fields.find(f => f.label === rule.field)

    switch (depField.type) {
      case 'dateTime':
      case 'time':
      case 'date':
      case 'decimal':
      case 'bigInteger':
      case 'textarea':
      case 'string': {
        const inputSelector = `${ruleWrapperSelector} input[type=text]`

        if (['dateTime', 'time', 'date'].includes(depField.type)) {
          await page.clearAndType({ inputSelector, value: rule.value, pressEnter: true })
        } else {
          await page.clearAndType({ inputSelector, value: rule.value })
        }
        break
      }

      case 'boolean': {
        const valueDropdownSelector = `${ruleWrapperSelector} [data-testid-dropdown-placeholder="..."]`

        await selectDropdownOptions({
          selector: valueDropdownSelector,
          optionsToSelect: rule.value ? ['Checked'] : ['Unchecked'],
          repeatable: depField.repeatable,
          page,
        })
        break
      }

      case 'select': {
        const valueDropdownSelector = `${ruleWrapperSelector} [data-testid-dropdown-placeholder="..."]`

        await selectDropdownOptions({
          selector: valueDropdownSelector,
          optionsToSelect: rule.value,
          repeatable: depField.repeatable,
          page
        })
        break
      }

      case 'relation': {
        const modalBtn = `${ruleWrapperSelector} [data-testid="selectContentTrigger"]`
        await selectContent({ page, modalBtn, field: depField, values: rule.value, operator: 'is' })
        break
      }

      case 'upload': {
        const modalBtn = `${ruleWrapperSelector} [data-testid="selectUploadTrigger"]`
        await selectUploads({ page, modalBtn, field: depField, values: rule.value, operator: 'is' })
        break
      }

      default:
        throw new Error('Unsupported type!')
    }

    // Do we have next rule
    if (index - 1 < settings.rules.length) {
      // Click on the plus button
      await page.click(`${ruleWrapperSelector} span.plus`)
    }
    index++
  }
}

const setRepeatableTextValueFieldSettingsValues = async ({
  options,
  fieldOrder,
  page
}) => {
  const repeatableFieldsWrapperSelector = `.fields>div:nth-child(${fieldOrder + 1}) .rep-text-val`

  let index = 0
  for (const option of options) {
    const textInputSelector = `${repeatableFieldsWrapperSelector}>div:nth-child(${index + 1})>div>div:nth-of-type(1) input`
    const valueInputSelector = `${repeatableFieldsWrapperSelector}>div:nth-child(${index + 1})>div>div:nth-of-type(2) input`

    await page.clearAndType({ inputSelector: textInputSelector, value: option.label })
    await page.clearAndType({ inputSelector: valueInputSelector, value: option.value })

    // Do we have next option
    if (options.length >= index + 2) {
      // Click on the plus button
      await page.click(`${repeatableFieldsWrapperSelector}>div:nth-child(${index + 1})>div>div:nth-of-type(3) span.plus`)
      await page.waitFor(500)
    }

    index++
  }
}

/**
 * string
 */
const string = async ({ field, index, page }) => {
  const fieldWrapperSelector = `.fields>div:nth-child(${index + 1})`

  await page.waitForSelector(fieldWrapperSelector)

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(1) input`, value: field.label })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(2) input`, value: field.name })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(3) input`, value: field.pattern })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(4) input`, value: field.patValMes })

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(5)`, check: field.required, page })

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(6)`, check: field.repeatable, page })
}

/**
 * date
 */
const date = async ({ field, index, page }) => {
  const fieldWrapperSelector = `.fields>div:nth-child(${index + 1})`

  await page.waitForSelector(fieldWrapperSelector)

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(1) input`, value: field.label })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(2) input`, value: field.name })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(3) input`, value: field.format })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(4) input`, value: field.calendarFormat })

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(5)`, check: field.showMonthDropdown, page })
  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(6)`, check: field.showYearDropdown, page })

  if (field.dropdownMode) {
    await selectDropdownOptions({
      selector: `${fieldWrapperSelector} .controllers>div:nth-child(7) .dropdown`,
      optionsToSelect: [field.dropdownMode],
      page
    })
  }

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(8)`, check: field.required, page })
  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(9)`, check: field.repeatable, page })
}

/**
 * boolean
 */
const boolean = async ({ field, index, page }) => {
  const fieldWrapperSelector = `.fields>div:nth-child(${index + 1})`

  await page.waitForSelector(fieldWrapperSelector)

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(1) input`, value: field.label })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(2) input`, value: field.name })
}

/**
 * bigInteger
 */
const bigInteger = async ({ field, index, page }) => {
  await string({ field, index, page })
}

/**
 * time
 */
const time = async ({ field, index, page }) => {
  const fieldWrapperSelector = `.fields>div:nth-child(${index + 1})`

  await page.waitForSelector(fieldWrapperSelector)

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(1) input`, value: field.label })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(2) input`, value: field.name })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(3) input`, value: field.format })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(4) input`, value: field.calendarFormat })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(5) input`, value: field.timeIntervals })

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(6)`, check: field.required, page })
  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(7)`, check: field.repeatable, page })
}

/**
 * dateTime
 */
const dateTime = async ({ field, index, page }) => {
  const fieldWrapperSelector = `.fields>div:nth-child(${index + 1})`

  await page.waitForSelector(fieldWrapperSelector)

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(1) input`, value: field.label })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(2) input`, value: field.name })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(3) input`, value: field.format })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(4) input`, value: field.calendarDateFormat })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(5) input`, value: field.calendarTimeFormat })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(6) input`, value: field.timeIntervals })

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(7)`, check: field.showMonthDropdown, page })
  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(8)`, check: field.showYearDropdown, page })

  if (field.dropdownMode) {
    await selectDropdownOptions({
      selector: `${fieldWrapperSelector} .controllers>div:nth-child(9) .dropdown`,
      optionsToSelect: [field.dropdownMode],
      page
    })
  }

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(10)`, check: field.required, page })
  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(11)`, check: field.repeatable, page })
}
/**
 * decimal
 */
const decimal = async ({ field, index, page }) => {
  await string({ field, index, page })
}

/**
 * relation
 */
const relation = async ({ field, index, page }) => {
  const fieldWrapperSelector = `.fields>div:nth-child(${index + 1})`

  await page.waitForSelector(fieldWrapperSelector)

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(1) input`, value: field.label })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(2) input`, value: field.name })

  if (field.reference) {
    await selectDropdownOptions({
      selector: `${fieldWrapperSelector} .controllers>div:nth-child(3) .dropdown`,
      optionsToSelect: [field.reference],
      page
    })
  }

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(4)`, check: field.required, page })
  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(5)`, check: field.repeatable, page })
}

/**
 * select
 */
const select = async ({ field, index, page }) => {
  const fieldWrapperSelector = `.fields>div:nth-child(${index + 1})`

  await page.waitForSelector(fieldWrapperSelector)

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(1) input`, value: field.label })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(2) input`, value: field.name })

  if (field.options) {
    await setRepeatableTextValueFieldSettingsValues({
      options: field.options,
      fieldOrder: index,
      page
    })
  }

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(4)`, check: field.required, page })

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(5)`, check: field.repeatable, page })
}

/**
 * upload
 */
const upload = async ({ field, index, page }) => {
  const fieldWrapperSelector = `.fields>div:nth-child(${index + 1})`

  await page.waitForSelector(fieldWrapperSelector)

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(1) input`, value: field.label })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(2) input`, value: field.name })

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(3)`, check: field.required, page })

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(4)`, check: field.repeatable, page })
}

/**
 * textarea
 */
const textarea = async ({ field, index, page }) => {
  const fieldWrapperSelector = `.fields>div:nth-child(${index + 1})`

  await page.waitForSelector(fieldWrapperSelector)

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(1) input`, value: field.label })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(2) input`, value: field.name })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(3) input`, value: field.pattern })

  await page.clearAndType({ inputSelector: `${fieldWrapperSelector} .controllers>div:nth-child(4) input`, value: field.patValMes })

  if (field.textareaType) {
    await selectDropdownOptions({
      selector: `${fieldWrapperSelector} .controllers>div:nth-child(5) .dropdown`,
      optionsToSelect: [field.textareaType],
      page
    })
  }

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(6)`, check: field.required, page })

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(7)`, check: field.repeatable, page })
}

/**
 * custom
 */
const custom = async ({ field, index, page }) => {
  const fieldWrapperSelector = `.fields>div:nth-child(${index + 1})`

  await page.waitForSelector(fieldWrapperSelector)

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(1)`, check: field.required, page })

  await checkCheckBox({ selector: `${fieldWrapperSelector} .controllers>div:nth-child(2)`, check: field.repeatable, page })
}

module.exports = {
  setConditionalLogicFieldSettingsValues,
  setRepeatableTextValueFieldSettingsValues,
  string,
  date,
  boolean,
  bigInteger,
  time,
  dateTime,
  decimal,
  relation,
  select,
  upload,
  textarea,
  custom,
  getButtonId,
}
