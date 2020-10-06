export default class ContentOrUploadConditionalLogicValueGuesser {
  constructor ({ field, depField, rule }) {
    this.field = field
    this.depField = depField
    this.rule = rule

    this.decider()
  }

  decider () {
    if (this.field.conditionalLogic.actionType === 'Hide') {
      switch (this.rule.operator) {
        case 'contains':
          if (this.field.visible) {
            // Don't select these values
            this.depFieldValue = { operator: 'does not contain', values: this.rule.value }
          } else {
            // Select these values
            this.depFieldValue = { operator: 'contains', values: this.rule.value }
          }
          break

        case 'is':
          if (this.field.visible) {
            // Don't select these values
            this.depFieldValue = { operator: 'is not', values: this.rule.value }
          } else {
            // Select these values
            this.depFieldValue = { operator: 'is', values: this.rule.value }
          }
          break

        case 'does not contain':
          if (this.field.visible) {
            // Select these values
            this.depFieldValue = { operator: 'contains', values: this.rule.value }
          } else {
            // Don't select these values
            this.depFieldValue = { operator: 'does not contain', values: this.rule.value }
          }
          break

        case 'is not':
          if (this.field.visible) {
            // Select these values
            this.depFieldValue = { operator: 'is', values: this.rule.value }
          } else {
            // Don't select these values
            this.depFieldValue = { operator: 'is not', values: this.rule.value }
          }
          break

        default:
          throw new Error('Unknown rule operator!')
      }
    } else if (this.field.conditionalLogic.actionType === 'Show') {
      switch (this.rule.operator) {
        case 'contains':
          if (this.field.visible) {
            // Select these values
            this.depFieldValue = { operator: 'contains', values: this.rule.value }
          } else {
            // Don't select these values
            this.depFieldValue = { operator: 'does not contain', values: this.rule.value }
          }
          break

        case 'is':
          if (this.field.visible) {
            // Select these values
            this.depFieldValue = { operator: 'is', values: this.rule.value }
          } else {
            // Don't select these values
            this.depFieldValue = { operator: 'is not', values: this.rule.value }
          }
          break

        case 'does not contain':
          if (this.field.visible) {
            // Don't select these values
            this.depFieldValue = { operator: 'does not contain', values: this.rule.value }
          } else {
            // Select these values
            this.depFieldValue = { operator: 'contains', values: this.rule.value }
          }
          break

        case 'is not':
          if (this.field.visible) {
            // Don't select these values
            this.depFieldValue = { operator: 'is not', values: this.rule.value }
          } else {
            // Select these values
            this.depFieldValue = { operator: 'is', values: this.rule.value }
          }
          break

        default:
          throw new Error('Unknown rule operator!')
      }
    }
  }
}
