import { type DataSourceOptions, type ObjectLiteral, SelectQueryBuilder } from 'typeorm'

export type ApplyFilterParams<T extends ObjectLiteral> = {
  query: SelectQueryBuilder<T>
  filters: QueryFilters[] | string
  model: string
  options?: DataSourceOptions
}

export type QueryFilters = {
  id: string
  value: string
}

export type CalculateLimitParams = {
  limit: number
  maxLimit: number
}

export type ApplyPaginationParams<T extends ObjectLiteral> = {
  query: SelectQueryBuilder<T>
  offset: number
  limit: number
  options?: {
    maxLimit?: number
  }
}

export type ApplySortParams<T extends ObjectLiteral> = {
  query: SelectQueryBuilder<T>
  sorts: QuerySorts[]
  model: string
  orderKey?: string
}

export type QuerySorts = {
  sort: string
  order: 'ASC' | 'DESC'
}

type RequestQuery = {
  filtered?: QueryFilters[] | undefined
  sorted?: QuerySorts[] | undefined
  page?: string | number
  pageSize?: string | number
  [key: string]:
    QueryFilters[] | QuerySorts[] | Record<string, unknown> | string | number | undefined
}

type QueryOptions = {
  limit?: number
  orderKey?: string
}

export type QueryParams<T extends ObjectLiteral> = {
  model: string
  query: SelectQueryBuilder<T>
  reqQuery: RequestQuery
  options?: QueryOptions
}

export type QueryBuilderParams<T extends ObjectLiteral> = {
  params: QueryParams<T>
  options?: DataSourceOptions
}
