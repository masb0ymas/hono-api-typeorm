import z from 'zod'

import { MAX_LIMIT } from '~/lib/constants/pagination'
import { validate } from '~/lib/validate'

const FilterSchema = z.object({
  id: z.string().refine(validate.fieldName, 'id must be a valid field name'),
  value: z.string(),
})

const SortSchema = z.object({
  sort: z.string().refine(validate.fieldName, 'sort must be a valid field name'),
  order: z.enum(['ASC', 'DESC']),
})

/**
 * Accepts a JSON-encoded array (e.g. `?filtered=[{"id":"email","value":"a"}]`).
 * Values are validated here so the query layer only ever sees well-formed data.
 */
const jsonArrayParam = <T extends z.ZodType>(item: T) =>
  z
    .string()
    .optional()
    .transform((value, ctx) => {
      if (value === undefined || value === '') return undefined

      let parsed: unknown
      try {
        parsed = JSON.parse(value)
      } catch {
        ctx.addIssue({ code: 'custom', message: 'must be a JSON-encoded array' })
        return z.NEVER
      }

      const result = z.array(item).safeParse(parsed)
      if (!result.success) {
        ctx.addIssue({ code: 'custom', message: 'contains invalid items' })
        return z.NEVER
      }

      return result.data
    })

export const QuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(10),
  filtered: jsonArrayParam(FilterSchema),
  sorted: jsonArrayParam(SortSchema),
})
