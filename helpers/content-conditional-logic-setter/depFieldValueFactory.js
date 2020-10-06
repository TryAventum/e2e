import TextareaStringConditionalLogicValueGuesser from './string'
import SelectConditionalLogicValueGuesser from './select'
import ContentOrUploadConditionalLogicValueGuesser from './upload'
import BooleanConditionalLogicValueGuesser from './boolean'
import DateTimeConditionalLogicValueGuesser from './dateTime'
import TimeConditionalLogicValueGuesser from './time'
import NumberConditionalLogicValueGuesser from './number'

export const depFieldValueFactory = ({ type, field, depField, rule }) => {
  switch (type) {
    case 'string': { const instance = new TextareaStringConditionalLogicValueGuesser({ field, depField, rule })
      return instance.depFieldValue
    }

    case 'textarea': { const instance = new TextareaStringConditionalLogicValueGuesser({ field, depField, rule })
      return instance.depFieldValue
    }

    case 'bigInteger': { const instance = new NumberConditionalLogicValueGuesser({ field, depField, rule })
      return instance.depFieldValue
    }

    case 'decimal': { const instance = new NumberConditionalLogicValueGuesser({ field, depField, rule })
      return instance.depFieldValue
    }

    case 'boolean': { const instance = new BooleanConditionalLogicValueGuesser({ field, depField, rule })
      return instance.depFieldValue
    }

    case 'dateTime': { const instance = new DateTimeConditionalLogicValueGuesser({ field, depField, rule })
      return instance.depFieldValue
    }

    case 'date': { const instance = new DateTimeConditionalLogicValueGuesser({ field, depField, rule })
      return instance.depFieldValue
    }

    case 'time': { const instance = new TimeConditionalLogicValueGuesser({ field, depField, rule })
      return instance.depFieldValue
    }

    case 'select': { const instance = new SelectConditionalLogicValueGuesser({ field, depField, rule })
      return instance.depFieldValue
    }

    case 'relation':
    case 'upload': { const instance = new ContentOrUploadConditionalLogicValueGuesser({ field, depField, rule })
      return instance.depFieldValue
    }

    default:
      throw new Error('Unsupported type!')
  }
}

export default depFieldValueFactory
