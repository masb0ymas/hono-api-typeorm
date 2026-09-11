import { type ObjectLiteral } from 'typeorm'
import { validate as uuidValidate } from 'uuid'

import { validate } from '../validate'
import type { ApplyFilterParams, QueryFilters } from './types'

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

  for (const item of filters) {
    // Field names are validated at the DTO boundary; re-check here because the
    // value is interpolated into SQL (query values stay parameterised).
    if (!validate.fieldName(item.id)) {
      continue
    }

    const check_uuid = uuidValidate(item.value)
    const check_numeric = validate.number(item.value)
    const expect_number_uuid = !check_numeric && !check_uuid

    const postgres_driver = options?.type === 'postgres'
    const mysql_driver = ['mysql', 'mariadb'].includes(String(options?.type))

    if (check_uuid || check_numeric) {
      query.andWhere(`${model}.${item.id} = :${item.id}`, {
        [`${item.id}`]: `${item.value}`,
      })
    }

    if (mysql_driver && expect_number_uuid) {
      query.andWhere(`${model}.${item.id} LIKE :${item.id}`, {
        [`${item.id}`]: `%${item.value}%`,
      })
    }

    if (postgres_driver && expect_number_uuid) {
      query.andWhere(`${model}.${item.id} ILIKE :${item.id}`, {
        [`${item.id}`]: `%${item.value}%`,
      })
    }
  }
}
