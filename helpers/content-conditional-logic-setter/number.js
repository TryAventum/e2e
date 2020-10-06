import faker from 'faker'
const random = require('lodash/random')

export default class NumberConditionalLogicValueGuesser {
  constructor ({ field, depField, rule }) {
    this.field = field
    this.depField = depField
    this.rule = rule

    this.decider()
  }

  getRandomNumber () {
    // We are supporting bigInteger & decimal fields
    const randomNumber = this.depField.type === 'bigInteger' ? faker.random.number() : faker.finance.amount(100, 10000, 4)

    return randomNumber
  }

  decider () {
    if (this.field.conditionalLogic.actionType === 'Hide') {
      switch (this.rule.operator) {
        case 'contains':
          if (this.field.visible) {
            this.isNot()
          } else {
            this.startsOrEndsWith()
          }
          break

        case 'does not contain':
          if (this.field.visible) {
            this.startsOrEndsWith(false)
          } else {
            this.isNot()
          }
          break

        case 'starts with':
          if (this.field.visible) {
            this.isNot()
          } else {
            this.startsOrEndsWith()
          }
          break

        case 'ends with':
          if (this.field.visible) {
            this.isNot()
          } else {
            this.startsOrEndsWith(true)
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

        default:
          throw new Error('Unknown rule operator!')
      }
    } else if (this.field.conditionalLogic.actionType === 'Show') {
      switch (this.rule.operator) {
        case 'contains':
          if (this.field.visible) {
            this.startsOrEndsWith(false)
          } else {
            this.isNot()
          }
          break

        case 'does not contain':
          if (this.field.visible) {
            this.isNot()
          } else {
            this.startsOrEndsWith()
          }
          break

        case 'starts with':
          if (this.field.visible) {
            this.startsOrEndsWith()
          } else {
            this.isNot()
          }
          break

        case 'ends with':
          if (this.field.visible) {
            this.startsOrEndsWith(true)
          } else {
            this.isNot()
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

        default:
          throw new Error('Unknown rule operator!')
      }
    }
  }

  startsOrEndsWith (starts = true) {
    const getRandom = () => {
      if (starts) {
        return Number(this.rule.value + '' + faker.random.number())
      }

      return Number(faker.random.number() + '' + this.rule.value)
    }

    if (this.rule.logicType) { // If the dep field is repeatable
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [getRandom(), getRandom()]
      } else {
        this.depFieldValue = [this.getRandomNumber(), getRandom()]
      }
    } else {
      this.depFieldValue = getRandom()
    }
    return this.depFieldValue
  }

  is () {
    if (this.rule.logicType) { // If the dep field is repeatable
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [this.rule.value, this.rule.value]
      } else {
        this.depFieldValue = [this.getRandomNumber(), this.rule.value]
      }
    } else {
      this.depFieldValue = this.rule.value
    }
    return this.depFieldValue
  }

  isNot () {
    if (this.rule.logicType) { // If the dep field is repeatable
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [this.getRandomNumber(), this.getRandomNumber()]
      } else {
        this.depFieldValue = [this.getRandomNumber(), this.rule.value]
      }
    } else {
      this.depFieldValue = this.getRandomNumber()
    }

    return this.depFieldValue
  }

  greaterThan () {
    if (this.rule.logicType) { // If the dep field is repeatable
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [this.rule.value + random(1, 4), this.rule.value + random(1, 4)]
      } else {
        this.depFieldValue = [this.rule.value + random(1, 4), this.getRandomNumber()]
      }
    } else {
      this.depFieldValue = this.rule.value + random(1, 4)
    }

    return this.depFieldValue
  }

  lessThan () {
    if (this.rule.logicType) { // If the dep field is repeatable
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [this.rule.value - random(1, 4), this.rule.value - random(1, 4)]
      } else {
        this.depFieldValue = [this.rule.value - random(1, 4), this.getRandomNumber()]
      }
    } else {
      this.depFieldValue = this.rule.value - random(1, 4)
    }

    return this.depFieldValue
  }
}
