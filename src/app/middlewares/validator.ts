import { zValidator } from '@hono/zod-validator'
import type { ValidationTargets } from 'hono'
import type { ZodSchema } from 'zod'

/**
 * A `zValidator` whose failures reach the central error handler, so every
 * validation error keeps the same response shape as the rest of the API.
 */
export function validateJson<T extends ZodSchema>(schema: T) {
  return zValidator('json', schema, (result) => {
    if (!result.success) {
      throw result.error
    }
  })
}

/**
 * Query-string variant of {@link validateJson}.
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return zValidator('query', schema, (result) => {
    if (!result.success) {
      throw result.error
    }
  })
}

/**
 * Path-parameter variant of {@link validateJson}.
 */
export function validateParam<T extends ZodSchema>(schema: T) {
  return zValidator('param', schema, (result) => {
    if (!result.success) {
      throw result.error
    }
  })
}

export type { ValidationTargets }
