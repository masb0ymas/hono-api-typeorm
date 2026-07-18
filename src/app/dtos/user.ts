import z from 'zod'

import { requiredString, requiredUUID } from '~/lib/validation'

export const UserCreateSchema = z.object({
  fullname: requiredString('fullname'),
  email: requiredString('email'),
  password: requiredString('password'),
  role_id: requiredUUID('role_id'),
})

export const UserUpdateSchema = z.object({
  fullname: requiredString('fullname'),
  role_id: requiredUUID('role_id'),
})

export const UserChangePasswordSchema = z
  .object({
    old_password: requiredString('old password'),
    password: requiredString('password'),
    confirm_password: requiredString('confirm password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type UserCreateDto = z.infer<typeof UserCreateSchema>
export type UserUpdateDto = z.infer<typeof UserUpdateSchema>
export type UserChangePasswordDto = z.infer<typeof UserChangePasswordSchema>
