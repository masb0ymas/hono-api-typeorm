import { validate as uuidValidate } from 'uuid'

import ErrorResponse from './http/errors'

export class validate {
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

  /**
   * Validates a database field/column name so it can be safely interpolated
   * into a query. Query values are always bound as parameters.
   * @param value The field name to validate
   * @returns True if the field name is safe to use
   */
  public static fieldName(value: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)
  }
}
