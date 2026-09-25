import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { ZodError } from 'zod'

import { BaseResponse } from '~/lib/http/errors'

export function errorHandler(error: Error, c: Context) {
  // Expected client errors (4xx) are not server faults; only log the ones that
  // indicate a bug or an outage (5xx and unknown errors).
  if (error instanceof BaseResponse) {
    if (error.statusCode >= 500) console.error(error)

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

  if (error instanceof HTTPException) {
    if (error.status >= 500) console.error(error)

    return c.json(
      { success: false, name: error.name, message: error.message },
      error.status as ContentfulStatusCode
    )
  }

  console.error(error)

  return c.json(
    { success: false, name: 'Internal Server Error', message: 'Internal server error' },
    500
  )
}
