import faker from 'faker'
import { format } from 'date-fns'
import { selectDropdownOptions, selectUploads, selectContent, checkCheckBox } from './shared'
import depFieldValueFactory from './content-conditional-logic-setter/depFieldValueFactory'
const conditionalLogic = require('../schemas/conditional-logic.json')
// const helpers = require('./schemaCustomFields')
const random = require('lodash/random')
const sampleSize = require('lodash/sampleSize')
const sample = require('lodash/sample')
const customField1 = require('../schemas/customField1.json')
const customField2 = require('../schemas/customField2.json')

const customFields = [customField1, customField2]
// const shuffle = require('lodash/shuffle')

const ContentHelpers = {
  setDepFieldValue: async ({ field, fields, page }) => {
    // NOTES: To display this field what value should this field have?
    // The value depends on:
    // 1) conditionalLogic.logicType //TODO
    // 2) conditionalLogic.actionType
    // 3) rule.operator
    // 4) rule.value
    // 5) rule.logicType

    // Should we make the field visible or not?
    const isVisible = faker.random.boolean()

    field.visible = isVisible

    for (const rule of field.conditionalLogic.rules) {
      // Get the field that this rule depends on
      const depField = fields.find(f => f.label === rule.field)
      const depFieldValue = depFieldValueFactory({ type: depField.type, field, depField, rule })
      // Set the value by reference
      depField.value = depFieldValue
    }

    return fields
  },
  valuesSetter: async ({
    fields, customFieldIndex,
    customFieldName,
    page,
    conditionalLogic,
    isCustomFieldRepeatable,
    isSelectorInsideCustomField
  }) => {
    for (const field of fields) {
      const fieldConLog = conditionalLogic.find(f => f.name === field.name)
      if (fieldConLog) {
        field.conditionalLogic = fieldConLog.conditionalLogic
      }
      /**
       * //TODO Validation Test
       */
      // Check if this field is required?
      // If the field is required try to clear the value of the field and submit to check the validation process.

      /**
       * Conditional Logic Test
       */
      // We will randomly pick if we want to make the field visible or not, and to achieve this we set the values for the fields in the conditional logic rules.
      if (field.conditionalLogic.enable) {
        fields = await ContentHelpers.setDepFieldValue({ field, fields, page })
      }
    }

    // These fields are not visible yet because of their conditional logic rules for example, but probably they will be visible in the future when the other fields values will meet their conditional logic rules.
    const invisibleFields = []
    for (const field of fields) {
      // const isFieldExist = await page.isElementExist(`.fields>[data-testid-name="${field.name}"]`)
      const fieldSelector = await ContentHelpers.getSelector({
        customFieldIndex,
        customFieldName,
        isCustomFieldRepeatable,
        isSelectorInsideCustomField,
        page,
        field: { ...field, repeatable: false },
        selector: '',
        wFs: false
      })
      const isFieldExist = await page.isElementExist(fieldSelector)
      if (!isFieldExist) {
        invisibleFields.push(field)
        continue
      }
      await ContentHelpers[field.type]({
        field,
        page,
        customFieldName,
        customFieldIndex,
        isCustomFieldRepeatable,
        isSelectorInsideCustomField
      })
    }

    // After we set a values for all the visible fields now it is the time to set some values for these fields
    for (const field of invisibleFields) {
      // const isFieldExist = await page.isElementExist(`.fields>[data-testid-name="${field.name}"]`)
      const fieldSelector = await ContentHelpers.getSelector({
        customFieldIndex,
        customFieldName,
        isCustomFieldRepeatable,
        isSelectorInsideCustomField,
        page,
        field: { ...field, repeatable: false },
        selector: '',
        wFs: false
      })
      const isFieldExist = await page.isElementExist(fieldSelector)
      if (!isFieldExist) {
        continue
      }
      await ContentHelpers[field.type]({
        field,
        page,
        customFieldName,
        customFieldIndex,
        isCustomFieldRepeatable,
        isSelectorInsideCustomField
      })
    }

    // Verify that the fields that have field.visible === false is not visible and vice versa
    // The fields that have "visible" property are the fields that have conditional logic enabled
    for (const field of fields) {
      if (field.visible === false || field.visible === true) {
        // const isFieldExist = await page.isElementExist(`.fields>[data-testid-name="${field.name}"]`)
        const fieldSelector = await ContentHelpers.getSelector({
          customFieldIndex,
          customFieldName,
          isCustomFieldRepeatable,
          isSelectorInsideCustomField,
          page,
          field: { ...field, repeatable: false },
          selector: '',
          wFs: false
        })
        const isFieldExist = await page.isElementExist(fieldSelector)
        expect(isFieldExist).toBe(field.visible)
      }
    }
  },
  getSelector: async ({
    customFieldIndex,
    customFieldName,
    isCustomFieldRepeatable,
    isSelectorInsideCustomField,
    i,
    page,
    field,
    selector = 'input',
    wFs = true
  }) => {
    let theSelector
    if (field.repeatable) {
      if (isSelectorInsideCustomField && isCustomFieldRepeatable) {
        // We have repeatable custom field
        theSelector = `.fields>[data-testid-name="${customFieldName}"] .sub-fields>div:nth-child(${customFieldIndex}) .custom-field-fields [data-testid-name="${field.name}"] .sub-fields>div:nth-child(${i}) ${selector}`
      } else if (isSelectorInsideCustomField && !isCustomFieldRepeatable) {
        // We have not repeatable custom field
        theSelector = `.fields>[data-testid-name="${customFieldName}"] .custom-field-fields [data-testid-name="${field.name}"] .sub-fields>div:nth-child(${i}) ${selector}`
      } else {
        // We have normal repeatable field
        theSelector = `.fields>[data-testid-name="${field.name}"] .sub-fields>div:nth-child(${i}) ${selector}`
      }
    } else {
      if (isSelectorInsideCustomField && isCustomFieldRepeatable) {
        theSelector = `.fields>[data-testid-name="${customFieldName}"] .sub-fields>div:nth-child(${customFieldIndex}) .custom-field-fields [data-testid-name="${field.name}"] ${selector}`
      } else if (isSelectorInsideCustomField && !isCustomFieldRepeatable) {
        theSelector = `.fields>[data-testid-name="${customFieldName}"] .custom-field-fields [data-testid-name="${field.name}"] ${selector}`
      } else {
        theSelector = `.fields>[data-testid-name="${field.name}"] ${selector}`
      }
    }
    if (wFs) {
      await page.waitForSelector(theSelector)
    }

    return theSelector
  },
  addField: async ({
    customFieldIndex,
    customFieldName,
    isCustomFieldRepeatable,
    isSelectorInsideCustomField,
    i,
    page,
    field
  }) => {
    const plusBtnSelector = await ContentHelpers.getSelector({
      customFieldIndex,
      customFieldName,
      isCustomFieldRepeatable,
      isSelectorInsideCustomField,
      i: i - 1,
      page,
      field,
      selector: 'span.plus'
    })

    await page.waitForSelector(plusBtnSelector)

    await page.evaluate(sel => document.querySelector(sel).click(), plusBtnSelector)
    // await page.click(plusBtnSelector)
  },
  prepareForUpdate: async ({
    customFieldIndex,
    customFieldName,
    isCustomFieldRepeatable,
    isSelectorInsideCustomField,
    page,
    field,
  }) => {
    const wholeFieldWrapper = await ContentHelpers.getSelector({
      customFieldIndex,
      customFieldName,
      isCustomFieldRepeatable,
      isSelectorInsideCustomField,
      page,
      field: { ...field, repeatable: false },
      selector: '',
      wFs: false,
    })

    const minusBtns = await page.$$(`${wholeFieldWrapper}span.minus`)

    if (minusBtns.length > 1) {
      // Randomly remove a field
      await sample(minusBtns).click()
      await ContentHelpers.prepareForUpdate({
        customFieldIndex,
        customFieldName,
        isCustomFieldRepeatable,
        isSelectorInsideCustomField,
        page,
        field,
      })
    }
  },
  string: async ({
    field,
    page,
    customFieldName,
    isCustomFieldRepeatable,
    isSelectorInsideCustomField,
    customFieldIndex,
    pressEnter = false
  }) => {
    const rep = () => {
      switch (field.type) {
        default:
        case 'string':
          // return faker.lorem.sentence()
          return faker.random.word()
        case 'decimal':
          return faker.finance.amount(100, 10000, 4)
        case 'bigInteger':
          return faker.random.number()
        case 'time':
          return format(faker.date.past(), 'h:mm aa')
        case 'date':
          return format(faker.date.past(), 'MMMM d, yyyy')
        case 'dateTime':
          return format(faker.date.past(), 'MMMM d, yyyy h:mm aa')
      }
    }

    if (field.repeatable) {
      await ContentHelpers.prepareForUpdate({
        field,
        page,
        customFieldName,
        isCustomFieldRepeatable,
        isSelectorInsideCustomField,
        customFieldIndex,
      })

      const fieldsToCreate = field.value ? field.value.length : random(1, 4)

      for (let i = 1; i <= fieldsToCreate; i++) {
        if (i > 1) {
          // Create a new field
          await ContentHelpers.addField({
            customFieldIndex,
            customFieldName,
            isCustomFieldRepeatable,
            isSelectorInsideCustomField,
            i,
            page,
            field
          })
        }
        const inputSelector = await ContentHelpers.getSelector({
          customFieldIndex,
          customFieldName,
          isCustomFieldRepeatable,
          isSelectorInsideCustomField,
          i,
          page,
          field
        })

        await page.clearAndType({ inputSelector, value: field.value ? field.value[i - 1] : rep(), pressEnter })
      }
    } else {
      const inputSelector = await ContentHelpers.getSelector({
        customFieldIndex,
        customFieldName,
        isCustomFieldRepeatable,
        isSelectorInsideCustomField,
        page,
        field
      })

      await page.clearAndType({ inputSelector, value: field.value ? field.value : rep(), pressEnter })
    }
  },
  boolean: async ({
    field,
    customFieldName,
    isCustomFieldRepeatable,
    isSelectorInsideCustomField,
    page,
    customFieldIndex
  }) => {
    const shouldCheck =
      field.value === true || field.value === false
        ? field.value
        : faker.random.boolean()

    if (shouldCheck) {
      const checkboxSelector = await ContentHelpers.getSelector({
        customFieldIndex,
        customFieldName,
        isCustomFieldRepeatable,
        isSelectorInsideCustomField,
        page,
        field,
        selector: ''
      })

      await checkCheckBox({ selector: checkboxSelector, check: shouldCheck, page })
    }
  },
  bigInteger: async (...args) => {
    await ContentHelpers.string(...args)
  },
  dateTime: async (args) => {
    await ContentHelpers.string({ ...args, pressEnter: true })
  },
  // dateTime: async ({
  //   field,
  //   customFieldName,
  //   isCustomFieldRepeatable,
  //   isSelectorInsideCustomField,
  //   page,
  //   customFieldIndex
  // }) => {
  //   // This function exist for DRY purpose
  //   const rep = async () => {
  //     // Wait for the calender to showup
  //     await page.waitForSelector('.react-datepicker')

  //     if (field.type === 'dateTime' || field.type === 'date') {
  //       // Click on random day
  //       await page.click(
  //         `.react-datepicker .react-datepicker__month>div:nth-child(${random(
  //           1,
  //           5
  //         )})>div:nth-child(${random(1, 6)})`
  //       )
  //     }

  //     if (field.type === 'dateTime' || field.type === 'time') {
  //       // Click on random time
  //       await page.click(
  //         `.react-datepicker .react-datepicker__time-list>li:nth-child(${random(
  //           1,
  //           65
  //         )})`
  //       )
  //     }
  //   }

  //   if (field.repeatable) {
  //     const fieldsToCreate = random(1, 4)

  //     for (let i = 1; i <= fieldsToCreate; i++) {
  //       if (i > 1) {
  //         // Create a new field
  //         await ContentHelpers.addField({
  //           customFieldIndex,
  //           customFieldName,
  //           isCustomFieldRepeatable,
  //           isSelectorInsideCustomField,
  //           field,
  //           i,
  //           page
  //         })
  //       }
  //       const inputSelector = await ContentHelpers.getSelector({
  //         customFieldIndex,
  //         customFieldName,
  //         isCustomFieldRepeatable,
  //         isSelectorInsideCustomField,
  //         i,
  //         page,
  //         field
  //       })

  //       // First click on the input field to open the date time picker
  //       await page.click(inputSelector)

  //       await rep()
  //     }
  //   } else {
  //     const inputSelector = await ContentHelpers.getSelector({
  //       customFieldIndex,
  //       customFieldName,
  //       isCustomFieldRepeatable,
  //       isSelectorInsideCustomField,
  //       page,
  //       field
  //     })

  //     // First click on the input field to open the date time picker
  //     await page.click(inputSelector)

  //     await rep()
  //   }
  // },
  date: async (args) => {
    await ContentHelpers.string({ ...args, pressEnter: true })
  },
  time: async (args) => {
    await ContentHelpers.string({ ...args, pressEnter: true })
  },
  decimal: async (...args) => {
    await ContentHelpers.string(...args)
  },
  relation: async ({
    field, page,
    customFieldName,
    isCustomFieldRepeatable,
    isSelectorInsideCustomField,
    customFieldIndex
  }) => {
    const modalBtn = await ContentHelpers.getSelector({
      customFieldIndex,
      customFieldName,
      isCustomFieldRepeatable,
      isSelectorInsideCustomField,
      page,
      field: { ...field, repeatable: false },
      selector: 'button'
    })

    let options = { page, modalBtn, field }

    if (field.value) {
      options = { ...options, ...field.value }
    }

    await selectContent(options)
  },
  select: async ({
    field, page,
    customFieldName,
    isCustomFieldRepeatable,
    isSelectorInsideCustomField,
    customFieldIndex
  }) => {
    const dropDownSelector = await ContentHelpers.getSelector({
      customFieldIndex,
      customFieldName,
      isCustomFieldRepeatable,
      isSelectorInsideCustomField,
      page,
      field: { ...field, repeatable: false },
      selector: '.dropdown'
    })

    let optionsToSelect
    if (field.value) {
      optionsToSelect = field.value
    } else {
      if (field.repeatable) {
        // Select random number of options
        optionsToSelect = sampleSize(field.options, random(1, field.options.length)).map(o => o.label)
      } else {
        // Select random option
        optionsToSelect = [sample(field.options)].map(o => o.label)
      }
    }

    await selectDropdownOptions({
      optionsToSelect: optionsToSelect,
      selector: dropDownSelector,
      repeatable: field.repeatable,
      page
    })
  },
  upload: async ({
    field, page,
    customFieldName,
    isCustomFieldRepeatable,
    isSelectorInsideCustomField,
    customFieldIndex
  }) => {
    const modalBtn = await ContentHelpers.getSelector({
      customFieldIndex,
      customFieldName,
      isCustomFieldRepeatable,
      isSelectorInsideCustomField,
      page,
      field: { ...field, repeatable: false },
      selector: 'button'
    })

    let options = { page, modalBtn, field }

    if (field.value) {
      options = { ...options, ...field.value }
    }

    await selectUploads(options)
  },
  textarea: async ({
    field, page, customFieldIndex, customFieldName,
    isCustomFieldRepeatable,
    isSelectorInsideCustomField
  }) => {
    const rep = async (textareaSelector, paragraph) => {
      if (field.textareaType && field.textareaType === 'WYSIWYG') {
        // Get the textarea id which is the tinymce editor id
        const editorId = await page.evaluate((_textareaSelector) => {
          return document.querySelector(_textareaSelector).id
        }, textareaSelector)

        // Insert the content into the tinymce
        await page.evaluate(
          (_editorId, _par) => {
            tinymce.get(_editorId).setContent(_par) // TODO I don't want to do it like this, but because tinymce uses iframe I couldn't get it to work!
          },
          editorId,
          paragraph
        )
      } else {
        await page.clearAndType({
          inputSelector: textareaSelector,
          value: paragraph,
        })
      }
    }
    if (field.repeatable) {
      await ContentHelpers.prepareForUpdate({
        field,
        page,
        customFieldName,
        isCustomFieldRepeatable,
        isSelectorInsideCustomField,
        customFieldIndex,
      })

      const fieldsToCreate = field.value ? field.value.length : random(1, 4)

      for (let i = 1; i <= fieldsToCreate; i++) {
        const val = field.value ? field.value[i - 1] : faker.random.word()
        if (i > 1) {
          // Create a new field
          await ContentHelpers.addField({
            customFieldIndex,
            customFieldName,
            isCustomFieldRepeatable,
            isSelectorInsideCustomField,
            field,
            i,
            page
          })
        }
        const textareaSelector = await ContentHelpers.getSelector({
          customFieldIndex,
          customFieldName,
          isCustomFieldRepeatable,
          isSelectorInsideCustomField,
          i,
          page,
          field,
          selector: 'textarea'
        })

        await rep(textareaSelector, val)
      }
    } else {
      const val = field.value ? field.value : faker.random.word()
      const textareaSelector = await ContentHelpers.getSelector({
        customFieldIndex,
        customFieldName,
        isCustomFieldRepeatable,
        isSelectorInsideCustomField,
        page,
        field,
        selector: 'textarea'
      })

      await rep(textareaSelector, val)
    }
  },
  custom: async ({ field, index, page }) => {
    const prepareForUpdate = async (_field) => {
      /**
       * Remove the extra fields and only keep one field
       */
      // Get the minus buttons
      const minusBtns = await page.$$(
        `.fields>[data-testid-name="${_field.name}"] .sub-fields .custom-field-fields + div span.minus`
      )

      if (minusBtns.length > 1) {
        // Randomly remove a field
        await sample(minusBtns).click()
        await prepareForUpdate(_field)
      }
    }

    const customFieldData = customFields.find((c) => c.name === field.name)

    if (field.repeatable) {
      await prepareForUpdate(field)

      const fieldsToCreate = random(1, 4)

      for (let i = 1; i <= fieldsToCreate; i++) {
        if (i > 1) {
          // Create a new field
          const plusBtnSelector = `.fields>[data-testid-name="${field.name}"] .sub-fields>div:nth-child(${i - 1}) .custom-field-fields + div span.plus`
          await page.click(plusBtnSelector)

          // Wait for the new field to appear
          await page.waitForSelector(
            `.fields>[data-testid-name="${field.name}"] .sub-fields>div:nth-child(${i}) .custom-field-fields`
          )
        }

        await ContentHelpers.valuesSetter({
          fields: customFieldData.fields,
          page,
          conditionalLogic,
          customFieldName: field.name,
          customFieldIndex: i,
          isCustomFieldRepeatable: field.repeatable,
          isSelectorInsideCustomField: true
        })
      }
    } else {
      await ContentHelpers.valuesSetter({
        fields: customFieldData.fields,
        page,
        conditionalLogic,
        customFieldName: field.name,
        isCustomFieldRepeatable: field.repeatable,
        isSelectorInsideCustomField: true
      })
    }
  }
}

export default ContentHelpers
