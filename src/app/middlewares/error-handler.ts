import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { ZodError } from 'zod'

import BaseResponse from '~/lib/http/errors/base'

export function errorHandler(error: Error, c: Context) {
  console.error(error)

  if (error instanceof BaseResponse) {
    return c.json(
      { success: false, name: error.name, message: error.message },
      error.statusCode as ContentfulStatusCode
    )
  }

  if (error instanceof ZodError) {
    return c.json(
      { success: false, name: 'Bad Request', message: 'Validation error', errors: error.issues },
      400
    )
  }

  return c.json({ success: false, message: 'Internal server error' }, 500)
}
