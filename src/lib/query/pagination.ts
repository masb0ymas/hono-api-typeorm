import { type ObjectLiteral } from 'typeorm'

import { validate } from '../validate'
import type { ApplyPaginationParams, CalculateLimitParams } from './types'

/**
 * Calculate page size
 */
function _calculateLimit({ limit, maxLimit }: CalculateLimitParams) {
  const min = 10
  const parseLimit = validate.number(limit)

  if (parseLimit > 0) {
    return Math.min(parseLimit, maxLimit)
  }

  return min
}

/**
 * Apply pagination to query
 */
export function applyPagination<T extends ObjectLiteral>({
  query,
  offset,
  limit,
  options,
}: ApplyPaginationParams<T>) {
  const parseOffset = validate.number(offset) || 0
  let parseLimit = _calculateLimit({ limit, maxLimit: options?.maxLimit ?? 100 })

  if (parseLimit <= 0) {
    parseLimit = 10
  }

  query.skip(parseOffset)
  query.take(parseLimit)
}
