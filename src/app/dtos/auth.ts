import z from 'zod'

import { requiredEmail, requiredPassword, requiredString } from '~/lib/validation'

export const SignUpSchema = z.object({
  fullname: requiredString('fullname'),
  email: requiredEmail('email'),
  password: requiredPassword('password'),
})

export const SignInSchema = z.object({
  email: requiredEmail('email'),
  password: requiredString('password'),
})

export const RefreshTokenSchema = z.object({
  refresh_token: requiredString('refresh_token'),
})

export type SignUpDto = z.infer<typeof SignUpSchema>
export type SignInDto = z.infer<typeof SignInSchema>
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>
