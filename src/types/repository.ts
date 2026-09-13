import type { ObjectLiteral, Repository } from 'typeorm'

import type { QueryFilters, QuerySorts } from '~/lib/query/types'

export type BaseServiceParams<T extends ObjectLiteral> = {
  repository: Repository<T>
  model: string
  entity: new () => T
}

export type FindParams = {
  offset: number
  limit: number
  filtered?: QueryFilters[]
  sorted?: QuerySorts[]
}

export type DtoFindAll<T extends ObjectLiteral> = {
  data: T[]
  total: number
}
