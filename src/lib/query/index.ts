import _ from 'lodash'
import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm'

import { env } from '~/config/env'

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

  const queryOffset = _.get(reqQuery, 'offset', 0)
  const queryLimit = _.get(reqQuery, 'limit', 10)
  const queryFilters = _.get(reqQuery, 'filtered', [])
  const querySorts = _.get(reqQuery, 'sorted', [])

  const orderKey = _.get(opt, 'orderKey', 'created_at')

  applyFilter({ query, filters: queryFilters, model, options })

  applySort({
    query,
    sorts: querySorts,
    model,
    orderKey,
  })

  applyPagination({
    query,
    offset: validate.number(queryOffset),
    limit: validate.number(queryLimit),
    options: { maxLimit: opt?.limit ?? 100 },
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
