export default class BooleanConditionalLogicValueGuesser {
  constructor ({ field, depField, rule }) {
    this.field = field
    this.depField = depField
    this.rule = rule

    this.decider()
  }

  decider () {
    if (this.field.conditionalLogic.actionType === 'Hide') {
      switch (this.rule.operator) {
        case 'is':
          if (this.field.visible) {
            this.depFieldValue = !this.rule.value
          } else {
            this.depFieldValue = this.rule.value
          }
          break

        case 'is not':
          if (this.field.visible) {
            this.depFieldValue = this.rule.value
          } else {
            this.depFieldValue = !this.rule.value
          }
          break

        default:
          throw new Error('Unknown rule operator!')
      }
    } else if (this.field.conditionalLogic.actionType === 'Show') {
      switch (this.rule.operator) {
        case 'is':
          if (this.field.visible) {
            this.depFieldValue = this.rule.value
          } else {
            this.depFieldValue = !this.rule.value
          }
          break

        case 'is not':
          if (this.field.visible) {
            this.depFieldValue = !this.rule.value
          } else {
            this.depFieldValue = this.rule.value
          }
          break

        default:
          throw new Error('Unknown rule operator!')
      }
    }
  }
}
