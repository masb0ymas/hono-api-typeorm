import z from 'zod'

import { requiredString } from '~/lib/validation'

export const RoleSchema = z.object({
  name: requiredString('name'),
})

export type RoleDto = z.infer<typeof RoleSchema>
