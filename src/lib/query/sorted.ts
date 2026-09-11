import { type ObjectLiteral } from 'typeorm'

import { validate } from '../validate'
import type { ApplySortParams } from './types'

/**
 * Apply sort to query
 */
export function applySort<T extends ObjectLiteral>({
  query,
  sorts,
  model,
  orderKey,
}: ApplySortParams<T>) {
  if (sorts && sorts.length > 0) {
    for (const item of sorts) {
      // Field names are validated at the DTO boundary; re-check here because the
      // value is interpolated into SQL.
      if (!validate.fieldName(item.sort)) {
        continue
      }

      query.addOrderBy(`${model}.${item.sort}`, item.order)
    }

    return
  }

  const defaultOrderKey = orderKey || 'created_at'
  if (validate.fieldName(defaultOrderKey)) {
    query.orderBy(`${model}.${defaultOrderKey}`, 'DESC')
  }
}
