import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm'

import { env } from '~/config/env'

import { validate } from '../validate'
import { applyFilter } from './filtered'
import { applyPagination } from './pagination'
import { applySort } from './sorted'
import type { QueryBuilderParams, QueryParams } from './types'

/** Maximum rows a single request may page through. */
const MAX_LIMIT = 100

/**
 * Query builder for TypeORM
 */
function QueryBuilder<T extends ObjectLiteral>({
  params,
  options,
}: QueryBuilderParams<T>): SelectQueryBuilder<T> {
  const { query, model, reqQuery, options: opt } = params

  const queryOffset = reqQuery.offset ?? 0
  const queryLimit = reqQuery.limit ?? 10

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
    offset: validate.number(queryOffset),
    limit: validate.number(queryLimit),
    options: { maxLimit: opt?.limit ?? MAX_LIMIT },
  })

  return query
}

type ConnectType = 'postgres' | 'mysql' | 'mariadb'

/**
 * Use query builder
 */
export function useQuery<T extends ObjectLiteral>(params: QueryParams<T>) {
  const connectType = env.typeorm.connection as ConnectType
  return QueryBuilder({ params, options: { type: connectType } })
}
