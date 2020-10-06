import faker from 'faker'
const random = require('lodash/random')
const times = require('lodash/times')

export default class TextareaStringConditionalLogicValueGuesser {
  constructor ({ field, depField, rule }) {
    this.field = field
    this.depField = depField
    this.rule = rule

    this.decider()
  }

  generateStringWithSpecificLength (length) {
    return times(length, () => random(35).toString(36)).join('')
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
            this.doesNotContain()
          } else {
            this.is()
          }
          break

        case 'is not':
          if (this.field.visible) {
            this.is()
          } else {
            this.doesNotContain()
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
            this.doesNotContain()
          } else {
            this.startsWith()
          }
          break

        case 'ends with':
          if (this.field.visible) {
            this.doesNotContain()
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
            this.doesNotContain()
          }
          break

        case 'is not':
          if (this.field.visible) {
            this.doesNotContain()
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
            this.doesNotContain()
          }
          break

        case 'ends with':
          if (this.field.visible) {
            this.endsWith()
          } else {
            this.doesNotContain()
          }
          break

        default:
          throw new Error('Unknown rule operator!')
      }
    }
  }

  is () {
    if (this.rule.logicType) {
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [this.rule.value, this.rule.value]
      } else {
        this.depFieldValue = [this.rule.value, faker.random.word(), faker.random.word()]
      }
    } else {
      this.depFieldValue = this.rule.value
    }

    return this.depFieldValue
  }

  contains () {
    if (this.rule.logicType) {
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [this.rule.value + faker.random.word(), this.rule.value + faker.random.word()]
      } else {
        this.depFieldValue = [this.rule.value + faker.random.word(), faker.random.word(), faker.random.word()]
      }
    } else {
      this.depFieldValue = this.rule.value + faker.random.word()
    }

    return this.depFieldValue
  }

  startsWith () {
    if (this.rule.logicType) {
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [this.rule.value + faker.random.word(), this.rule.value + faker.random.word()]
      } else {
        this.depFieldValue = [this.rule.value + faker.random.word(), faker.random.word(), faker.random.word()]
      }
    } else {
      this.depFieldValue = this.rule.value + faker.random.word()
    }

    return this.depFieldValue
  }

  endsWith () {
    if (this.rule.logicType) {
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [faker.random.word() + this.rule.value, faker.random.word() + this.rule.value]
      } else {
        this.depFieldValue = [faker.random.word() + this.rule.value, faker.random.word(), faker.random.word()]
      }
    } else {
      this.depFieldValue = faker.random.word() + this.rule.value
    }

    return this.depFieldValue
  }

  greaterThan () {
    const stringLength = this.rule.value + 1

    if (this.rule.logicType) {
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [this.generateStringWithSpecificLength(stringLength), this.generateStringWithSpecificLength(stringLength)]
      } else {
        this.depFieldValue = [this.generateStringWithSpecificLength(stringLength), faker.random.word(), faker.random.word()]
      }
    } else {
      this.depFieldValue = this.generateStringWithSpecificLength(stringLength)
    }

    return this.depFieldValue
  }

  lessThan () {
    const stringLength = this.rule.value - 1

    if (this.rule.logicType) {
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [this.generateStringWithSpecificLength(stringLength), this.generateStringWithSpecificLength(stringLength)]
      } else {
        this.depFieldValue = [this.generateStringWithSpecificLength(stringLength), faker.random.word(), faker.random.word()]
      }
    } else {
      this.depFieldValue = this.generateStringWithSpecificLength(stringLength)
    }

    return this.depFieldValue
  }

  doesNotContain () {
    // If the dep field is repeatable
    if (this.rule.logicType) {
      // if (this.rule.logicType === 'All') {
      this.depFieldValue = [faker.random.word(), faker.random.word()]
      // } else {

      // }
    } else {
      this.depFieldValue = faker.random.word()
    }
    return this.depFieldValue
  }
}
