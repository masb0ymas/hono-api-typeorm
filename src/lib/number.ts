/**
 * Checks if a value is numeric
 * @param value The value to check
 * @returns True if the value is numeric, false otherwise
 */
export function isNumeric(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value)
  }

  if (typeof value === 'string' && value.trim() !== '') {
    return Number.isFinite(Number(value))
  }

  return false
}
