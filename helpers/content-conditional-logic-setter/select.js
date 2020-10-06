const sampleSize = require('lodash/sampleSize')
const sample = require('lodash/sample')
const random = require('lodash/random')

export default class SelectConditionalLogicValueGuesser {
  constructor ({ field, depField, rule }) {
    this.field = field
    this.depField = depField
    this.rule = rule

    this.decider()
  }

  /**
   * this.rule.value holds the label of the option in order for puppeteer to click on it,
   * in some cases we need the value of the option
   */
  getRuleOptionValue () {
    return this.depField.options.find(o => o.label === this.rule.value)
  }

  decider () {
    if (this.field.conditionalLogic.actionType === 'Hide') {
      switch (this.rule.operator) {
        case 'contains':
          if (this.field.visible) {
            this.doesNotContain()
          } else {
            this.contains()
          }
          break

        case 'does not contain':
          if (this.field.visible) {
            this.contains()
          } else {
            this.doesNotContain()
          }
          break

        case 'is':
          if (this.field.visible) {
            this.isNot()
          } else {
            this.is()
          }
          break

        case 'is not':
          if (this.field.visible) {
            this.is()
          } else {
            this.isNot()
          }
          break

        case 'greater than':
          if (this.field.visible) {
            this.lessThan()
          } else {
            this.greaterThan()
          }
          break

        case 'less than':
          if (this.field.visible) {
            this.greaterThan()
          } else {
            this.lessThan()
          }
          break

        case 'starts with':
          if (this.field.visible) {
            this.endsWith()
          } else {
            this.startsWith()
          }
          break

        case 'ends with':
          if (this.field.visible) {
            this.startsWith()
          } else {
            this.endsWith()
          }
          break

        default:
          throw new Error('Unknown rule operator!')
      }
    } else if (this.field.conditionalLogic.actionType === 'Show') {
      switch (this.rule.operator) {
        case 'contains':
          if (this.field.visible) {
            this.contains()
          } else {
            this.doesNotContain()
          }
          break

        case 'does not contain':
          if (this.field.visible) {
            this.doesNotContain()
          } else {
            this.contains()
          }
          break

        case 'is':
          if (this.field.visible) {
            this.is()
          } else {
            this.isNot()
          }
          break

        case 'is not':
          if (this.field.visible) {
            this.isNot()
          } else {
            this.is()
          }
          break

        case 'greater than':
          if (this.field.visible) {
            this.greaterThan()
          } else {
            this.lessThan()
          }
          break

        case 'less than':
          if (this.field.visible) {
            this.lessThan()
          } else {
            this.greaterThan()
          }
          break

        case 'starts with':
          if (this.field.visible) {
            this.startsWith()
          } else {
            this.endsWith()
          }
          break

        case 'ends with':
          if (this.field.visible) {
            this.endsWith()
          } else {
            this.startsWith()
          }
          break

        default:
          throw new Error('Unknown rule operator!')
      }
    }
  }

  greaterThan () {
    // Get the options that their values greater than the this.getRuleOptionValue() value
    const tmp = this.depField.options.filter(o => Number(o.value) > Number(this.getRuleOptionValue()))

    // pick random option
    this.depFieldValue = [sample(tmp)].map(o => o.label)
  }

  lessThan () {
    // Get the options that their values less than the this.getRuleOptionValue() value
    const tmp = this.depField.options.filter(o => Number(o.value) < Number(this.getRuleOptionValue()))

    // pick random option
    this.depFieldValue = [sample(tmp)].map(o => o.label)
  }

  startsWith () {
    // Get the options that their values starts with this.getRuleOptionValue() value
    const tmp = this.depField.options.filter(o => o.value.startsWith(this.getRuleOptionValue()))

    // pick random option
    this.depFieldValue = [sample(tmp)].map(o => o.label)
  }

  endsWith () {
    // Get the options that their values starts with this.getRuleOptionValue() value
    const tmp = this.depField.options.filter(o => o.value.endsWith(this.getRuleOptionValue()))

    // pick random option
    this.depFieldValue = [sample(tmp)].map(o => o.label)
  }

  is () {
    this.depFieldValue = this.rule.value
  }

  isNot () {
    // Find the options that in depField.options and not in this.rule.value
    const tmp = this.depField.options.filter(o => !this.rule.value.includes(o.label))

    if (this.depField.repeatable) {
      this.depFieldValue = sampleSize(tmp, random(1, tmp.length)).map(o => o.label)
    } else {
      this.depFieldValue = [sample(tmp)].map(o => o.label)
    }
  }

  contains () {
    if (this.depField.repeatable) {
      // We use Set to make the array unique
      this.depFieldValue = [...new Set([...this.rule.value, ...sampleSize(this.depField.options, random(1, this.depField.options.length)).map(o => o.label)])]
    } else {
      this.depFieldValue = this.rule.value
    }
  }

  doesNotContain () {
    if (this.depField.repeatable) {
      const tmp = this.depField.options.filter(o => !this.rule.value.includes(o.label))
      this.depFieldValue = sampleSize(tmp, random(1, tmp.length)).map(o => o.label)
    } else {
      const tmp = this.depField.options.find(o => o.label !== this.rule.value[0])
      this.depFieldValue = [tmp.label]
    }
  }
}
