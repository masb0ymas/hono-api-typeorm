/**
 * Convert a time string to milliseconds.
 * Supports: ms, s/sec, m/min, h/hr, d, w, y — plural forms included.
 * @param value - Time string (e.g. "7d", "2h", "30min") or a number of milliseconds
 * @example
 * ms("2d") // 172800000
 * ms("1.5h") // 5400000
 */
export function ms(value: string | number): number {
  if (typeof value === 'number') return Math.abs(value)

  const match = value
    .trim()
    .toLowerCase()
    .match(/^(-?\d*\.?\d+)\s*([a-z]+)$/)
  if (!match) {
    throw new Error(`Invalid time format: "${value}". Expected format like "2d", "1.5h", "30min"`)
  }

  const SECOND = 1000
  const units: Record<string, number> = {
    ms: 1,
    millisecond: 1,
    s: SECOND,
    sec: SECOND,
    second: SECOND,
    m: 60 * SECOND,
    min: 60 * SECOND,
    minute: 60 * SECOND,
    h: 60 * 60 * SECOND,
    hr: 60 * 60 * SECOND,
    hour: 60 * 60 * SECOND,
    d: 24 * 60 * 60 * SECOND,
    day: 24 * 60 * 60 * SECOND,
    w: 7 * 24 * 60 * 60 * SECOND,
    week: 7 * 24 * 60 * 60 * SECOND,
    y: 365.25 * 24 * 60 * 60 * SECOND,
    year: 365.25 * 24 * 60 * 60 * SECOND,
  }

  const [, numStr, unit] = match
  const factor = units[unit] ?? units[unit.replace(/s$/, '')]
  if (factor === undefined) {
    throw new Error(`Unsupported time unit: "${unit}"`)
  }

  return Math.round(Math.abs(parseFloat(numStr)) * factor)
}
