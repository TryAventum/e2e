import faker from 'faker'
import { format, parse, addMinutes, subMinutes } from 'date-fns'

export default class TimeConditionalLogicValueGuesser {
  constructor ({ field, depField, rule }) {
    this.field = field
    this.depField = depField
    this.rule = rule

    this.decider()
  }

  getRandomTime () {
    let fakeDateTime = faker.date.past(7, new Date())
    const ruleDateTime = parse(this.rule.value, 'h:mm aa', new Date())

    // If the rule value equal to the dateTime that we generated then generate a new one
    if (fakeDateTime.getTime() === ruleDateTime.getTime()) {
      fakeDateTime = this.getRandomTime()
    }

    return fakeDateTime
  }

  getFormattedRandomTime () {
    return format(this.getRandomTime(), 'h:mm aa')
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
        this.depFieldValue = [this.rule.value, this.getFormattedRandomTime()]
      }
    } else {
      this.depFieldValue = this.rule.value
    }

    return this.depFieldValue
  }

  isNot () {
    if (this.rule.logicType) { // If the dep field is repeatable
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [this.getFormattedRandomTime(), this.getFormattedRandomTime()]
      } else {
        this.depFieldValue = [this.getFormattedRandomTime(), this.rule.value]
      }
    } else {
      this.depFieldValue = this.getFormattedRandomTime()
    }

    return this.depFieldValue
  }

  lessThan () {
    // We subtracting 10 days from this.rule.value date
    const ruleValueMinus10Minutes = format(subMinutes(parse(this.rule.value, 'h:mm aa', new Date()), 10), 'h:mm aa')

    if (this.rule.logicType) { // If the dep field is repeatable
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [ruleValueMinus10Minutes, ruleValueMinus10Minutes]
      } else {
        this.depFieldValue = [ruleValueMinus10Minutes, this.getFormattedRandomTime()]
      }
    } else {
      this.depFieldValue = ruleValueMinus10Minutes
    }

    return this.depFieldValue
  }

  greaterThan () {
    // We adding 10 days to this.rule.value date
    const ruleValuePlus10Minutes = format(addMinutes(parse(this.rule.value, 'h:mm aa', new Date()), 10), 'h:mm aa')

    if (this.rule.logicType) { // If the dep field is repeatable
      if (this.rule.logicType === 'All') {
        this.depFieldValue = [ruleValuePlus10Minutes, ruleValuePlus10Minutes]
      } else {
        this.depFieldValue = [ruleValuePlus10Minutes, this.getFormattedRandomTime()]
      }
    } else {
      this.depFieldValue = ruleValuePlus10Minutes
    }

    return this.depFieldValue
  }
}
