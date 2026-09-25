import z from 'zod'

export const BaseGetParamSchema = z.object({
  id: z.uuid('id must be a valid UUID'),
})
