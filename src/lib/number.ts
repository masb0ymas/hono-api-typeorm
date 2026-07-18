import _ from 'lodash'

/**
 * Checks if a value is numeric
 * @param value The value to check
 * @returns True if the value is numeric, false otherwise
 */
export function isNumeric(value: unknown): boolean {
  return !_.isNaN(parseFloat(value as string)) && _.isFinite(value as number)
}
