import { type ObjectLiteral } from 'typeorm'

import { validate } from '../validate'
import type { ApplyPaginationParams } from './types'

const DEFAULT_LIMIT = 10

/**
 * Calculate page size
 */
function _calculateLimit({ limit, maxLimit }: { limit: number; maxLimit: number }) {
  const parseLimit = validate.number(limit)

  if (parseLimit > 0) {
    return Math.min(parseLimit, maxLimit)
  }

  return DEFAULT_LIMIT
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
  const parseLimit = _calculateLimit({ limit, maxLimit: options?.maxLimit ?? 100 })

  query.skip(parseOffset)
  query.take(parseLimit)
}
