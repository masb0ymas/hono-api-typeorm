import z from 'zod'

import { requiredString } from '~/lib/validation'

export const SignUpSchema = z.object({
  email: requiredString('email'),
  first_name: requiredString('first_name'),
  last_name: requiredString('last_name'),
  password: requiredString('password'),
})

export const SignInSchema = z.object({
  email: requiredString('email'),
  password: requiredString('password'),
})

export const SignOutSchema = z.object({
  token: requiredString('token'),
})

export const RefreshTokenSchema = z.object({
  refresh_token: requiredString('refresh_token'),
})

export type SignUpDto = z.infer<typeof SignUpSchema>
export type SignInDto = z.infer<typeof SignInSchema>
export type SignOutDto = z.infer<typeof SignOutSchema>
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>
