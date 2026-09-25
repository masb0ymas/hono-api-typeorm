import { type ObjectLiteral } from 'typeorm'

import { MAX_LIMIT } from '~/lib/constants/pagination'

import type { ApplyPaginationParams } from './types'

const DEFAULT_LIMIT = 10

/**
 * Apply pagination to query. Inputs are already coerced/validated by the DTO
 * layer; this only applies the bounds and defaults.
 */
export function applyPagination<T extends ObjectLiteral>({
  query,
  offset,
  limit,
  options,
}: ApplyPaginationParams<T>) {
  query.skip(offset || 0)
  query.take(limit > 0 ? Math.min(limit, options?.maxLimit ?? MAX_LIMIT) : DEFAULT_LIMIT)
}
