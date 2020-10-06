import faker from 'faker'
import { format, parse, addDays, subDays } from 'date-fns'

export default class DateTimeConditionalLogicValueGuesser {
  constructor ({ field, depField, rule }) {
    this.field = field
    this.depField = depField
    this.rule = rule

    if (depField.type === 'date') {
      this.format = 'MMMM d, yyyy'
    } else {
      this.format = 'MMMM d, yyyy h:mm aa'
    }

    this.decider()
  }

  getRandomDateTime () {
    let fakeDateTime = faker.date.past(7, new Date())
    const ruleDateTime = parse(this.rule.value, this.format, new Date())

    // If the rule value equal to the dateTime that we generated then generate a new one
    if (fakeDateTime.getTime() === ruleDateTime.getTime()) {
      fakeDateTime = this.getRandomDateTime()
    }

    return fakeDateTime
  }

  getFormattedRandomDateTime () {
    return format(this.getRandomDateTime(), this.format)
  }

  decider () {
    if (this.field.conditionalLogic.actionType === 'Hide') {
      switch (this.rule.operator) {
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

  is () {
    if (this.rule.logicType) { // If the dep field is repeatable
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [this.rule.value, this.rule.value]
      } else {
        this.depFieldValue = [this.rule.value, this.getFormattedRandomDateTime()]
      }
    } else {
      this.depFieldValue = this.rule.value
    }

    return this.depFieldValue
  }

  greaterThan () {
    // We adding 10 days to this.rule.value date
    const ruleValuePlus10Days = format(addDays(parse(this.rule.value, this.format, new Date()), 10), this.format)

    if (this.rule.logicType) { // If the dep field is repeatable
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [ruleValuePlus10Days, ruleValuePlus10Days]
      } else {
        this.depFieldValue = [ruleValuePlus10Days, this.getFormattedRandomDateTime()]
      }
    } else {
      this.depFieldValue = ruleValuePlus10Days
    }

    return this.depFieldValue
  }

  lessThan () {
    // We subtracting 10 days from this.rule.value date
    const ruleValueMinus10Days = format(subDays(parse(this.rule.value, this.format, new Date()), 10), this.format)

    if (this.rule.logicType) { // If the dep field is repeatable
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [ruleValueMinus10Days, ruleValueMinus10Days]
      } else {
        this.depFieldValue = [ruleValueMinus10Days, this.getFormattedRandomDateTime()]
      }
    } else {
      this.depFieldValue = ruleValueMinus10Days
    }

    return this.depFieldValue
  }

  isNot () {
    if (this.rule.logicType) { // If the dep field is repeatable
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [this.getFormattedRandomDateTime(), this.getFormattedRandomDateTime()]
      } else {
        this.depFieldValue = [this.getFormattedRandomDateTime(), this.rule.value]
      }
    } else {
      this.depFieldValue = this.getFormattedRandomDateTime()
    }

    return this.depFieldValue
  }
}
