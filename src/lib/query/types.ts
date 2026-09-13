import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm'

export type ApplyFilterParams<T extends ObjectLiteral> = {
  query: SelectQueryBuilder<T>
  filters: QueryFilters[] | undefined
  model: string
  options?: {
    type?: string
  }
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
  sorts: QuerySorts[] | undefined
  model: string
  orderKey?: string
}

export type QuerySorts = {
  sort: string
  order: 'ASC' | 'DESC'
}

type RequestQuery = {
  offset?: number
  limit?: number
  filtered?: QueryFilters[]
  sorted?: QuerySorts[]
}

type QueryOptions = {
  maxLimit?: number
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
  options?: {
    type?: string
  }
}
