import { isValid } from 'date-fns'
import { validate as uuidValidate } from 'uuid'

import ErrorResponse from './http/errors'
import { isNumeric } from './number'

const emptyValues = [null, undefined, '', 'null', 'undefined']
const invalidValues = [...emptyValues, false, 0, 'false', '0']

export class validate {
  /**
   * Validates and converts a value to a number
   * @param value The value to validate and convert
   * @returns The validated number or 0 if invalid
   */
  public static number(value: unknown) {
    if (isNumeric(Number(value))) {
      return Number(value)
    }

    return 0
  }

  /**
   * Validates and returns a non-empty string or null
   * @param value The value to validate
   * @returns The validated string or null if empty
   */
  public static empty(value: string | null | undefined) {
    if (emptyValues.includes(value)) {
      return null
    }

    return value
  }

  /**
   * Validates and converts a value to a boolean
   * @param value The value to validate and convert
   * @returns The validated boolean
   */
  public static boolean(value: string | number | boolean | null | undefined): boolean {
    if (invalidValues.includes(value)) {
      return false
    }

    return true
  }

  /**
   * Validates if a value is a valid date
   * @param value The value to validate
   * @returns True if the value is a valid date, false otherwise
   */
  public static isDate(value: string | number | Date | null): boolean {
    if (value == null) {
      return false
    }

    const valueDate = value instanceof Date ? value : new Date(value)
    return isValid(valueDate)
  }

  /**
   * Validates if a value is a valid UUID
   * @param value The value to validate
   * @returns The validated UUID
   * @throws ErrorResponse.BadRequest if the UUID is invalid
   */
  public static uuid(value: string): string {
    if (!uuidValidate(value)) {
      throw new ErrorResponse.BadRequest('Invalid UUID')
    }

    return value
  }
}
