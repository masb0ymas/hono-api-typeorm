import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm'

import { env } from '~/config/env'
import { MAX_LIMIT } from '~/lib/constants/pagination'

import { applyFilter } from './filtered'
import { applyPagination } from './pagination'
import { applySort } from './sorted'
import type { QueryParams } from './types'

/**
 * Apply filtering, sorting, and pagination (from the request query) to a
 * TypeORM query builder.
 */
export function useQuery<T extends ObjectLiteral>({
  query,
  model,
  reqQuery,
  options,
}: QueryParams<T>): SelectQueryBuilder<T> {
  applyFilter({
    query,
    filters: reqQuery.filtered,
    model,
    options: { type: env.typeorm.connection },
  })

  applySort({
    query,
    sorts: reqQuery.sorted,
    model,
    orderKey: options?.orderKey ?? 'created_at',
  })

  applyPagination({
    query,
    offset: reqQuery.offset ?? 0,
    limit: reqQuery.limit ?? 10,
    options: { maxLimit: options?.maxLimit ?? MAX_LIMIT },
  })

  return query
}
