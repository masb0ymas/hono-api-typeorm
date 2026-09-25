import z from 'zod'

import { requiredEmail, requiredPassword, requiredString, requiredUUID } from '~/lib/validation'

export const UserCreateSchema = z.object({
  fullname: requiredString('fullname'),
  email: requiredEmail('email'),
  password: requiredPassword('password'),
  role_id: requiredUUID('role_id'),
})

export const UserUpdateSchema = z.object({
  fullname: requiredString('fullname'),
  role_id: requiredUUID('role_id'),
})

export const UserChangePasswordSchema = z
  .object({
    old_password: requiredString('old password'),
    password: requiredPassword('password'),
    confirm_password: requiredString('confirm password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
