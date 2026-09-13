import { type ObjectLiteral, SelectQueryBuilder } from 'typeorm'

import { env } from '~/config/env'
import { MAX_LIMIT } from '~/lib/constants/pagination'

import { validate } from '../validate'
import { applyFilter } from './filtered'
import { applyPagination } from './pagination'
import { applySort } from './sorted'
import type { QueryBuilderParams, QueryParams } from './types'

/**
 * Query builder for TypeORM
 */
function QueryBuilder<T extends ObjectLiteral>({
  params,
  options,
}: QueryBuilderParams<T>): SelectQueryBuilder<T> {
  const { query, model, reqQuery, options: opt } = params

  const orderKey = opt?.orderKey ?? 'created_at'

  applyFilter({ query, filters: reqQuery.filtered, model, options })

  applySort({
    query,
    sorts: reqQuery.sorted,
    model,
    orderKey,
  })

  applyPagination({
    query,
    offset: validate.number(reqQuery.offset ?? 0),
    limit: validate.number(reqQuery.limit ?? 10),
    options: { maxLimit: opt?.maxLimit ?? MAX_LIMIT },
  })

  return query
}

/**
 * Use query builder
 */
export function useQuery<T extends ObjectLiteral>(params: QueryParams<T>) {
  return QueryBuilder({
    params,
    options: { type: env.typeorm.connection },
  })
}
