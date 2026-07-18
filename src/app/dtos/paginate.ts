import z from 'zod'

export const QuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
})

export type QueryDto = z.infer<typeof QuerySchema>
