import z from 'zod'

export const BaseGetParamSchema = z.object({
  id: z.uuid('id must be a valid UUID'),
})

export type BaseGetParamDto = z.infer<typeof BaseGetParamSchema>
