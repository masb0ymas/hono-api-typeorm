import { type ObjectLiteral } from 'typeorm'
import { validate as uuidValidate } from 'uuid'

import { isNumeric } from '../number'
import { validate } from '../validate'
import type { ApplyFilterParams } from './types'

/**
 * Apply filter
 */
export function applyFilter<T extends ObjectLiteral>({
  query,
  filters,
  model,
  options,
}: ApplyFilterParams<T>) {
  if (!filters || filters.length === 0) return

  const isPostgres = options?.type === 'postgres'
  const isMysql = ['mysql', 'mariadb'].includes(String(options?.type))

  for (const [index, item] of filters.entries()) {
    // Field names are validated at the DTO boundary; re-check here because the
    // value is interpolated into SQL (query values stay parameterised).
    if (!validate.fieldName(item.id)) {
      continue
    }

    // Parameter names are index-suffixed so two filters on the same field
    // don't overwrite each other.
    const param = `filter_${index}`
    const isUuid = uuidValidate(item.value)
    const isExactMatch = isUuid || isNumeric(item.value)

    if (isExactMatch) {
      query.andWhere(`${model}.${item.id} = :${param}`, { [param]: item.value })
      continue
    }

    if (isPostgres) {
      query.andWhere(`${model}.${item.id} ILIKE :${param}`, { [param]: `%${item.value}%` })
    } else if (isMysql) {
      query.andWhere(`${model}.${item.id} LIKE :${param}`, { [param]: `%${item.value}%` })
    }
  }
}
