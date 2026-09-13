import z from 'zod'

import type {
  NestedValidationMessagesKey,
  ValidationMessagesKey,
  ValidationMessagesParams,
} from '~/types/message'

import { VALIDATION_MESSAGES } from './constants/message'

/**
 * Detect validation messages type
 * @param rule
 * @param params
 * @returns
 */
export function detectValidationMessagesType<R extends ValidationMessagesKey>(
  rule: R,
  params: ValidationMessagesParams[R]
): NestedValidationMessagesKey<R> | undefined {
  const msg = VALIDATION_MESSAGES[rule]
  if (typeof msg !== 'object') return undefined

  const hasMinNumber = (value: unknown): value is { min: number } =>
    typeof (value as Record<string, unknown>)?.min === 'number'

  if ('string' in msg && hasMinNumber(params)) {
    return 'string' as NestedValidationMessagesKey<R>
  }
  if ('numeric' in msg && hasMinNumber(params)) {
    return 'numeric' as NestedValidationMessagesKey<R>
  }

  return 'string' as NestedValidationMessagesKey<R>
}

/**
 * Get validation message
 * @param rule
 * @param params
 * @param type
 * @returns
 */
export function getValidationMessage<R extends ValidationMessagesKey>(
  rule: R,
  params: ValidationMessagesParams[R],
  type?: NestedValidationMessagesKey<R>
): string {
  const message = VALIDATION_MESSAGES[rule]
  let template: string | undefined

  if (typeof message === 'object') {
    const resolvedType = type ?? detectValidationMessagesType(rule, params)
    if (!resolvedType) {
      throw new Error(
        `Rule "${rule}" requires a type (e.g. "string" | "numeric" | "file" | "array").`
      )
    }

    if (resolvedType in message) {
      template = (message as Record<string, string>)[resolvedType as string]
    } else {
      throw new Error(`Type "${String(resolvedType)}" is not valid for rule "${rule}"`)
    }
  } else {
    template = message
  }

  if (!template) {
    throw new Error(`Template for rule "${rule}" not found`)
  }

  return template.replace(/:([a-zA-Z_]+)/g, (_, key) => {
    const templateParams = params as Record<string, unknown>
    return templateParams[key] !== undefined ? String(templateParams[key]) : `:${key}`
  })
}

/**
 * Required string validation
 * @param attribute
 * @returns
 */
export const requiredString = (attribute: string) =>
  z.string().nonempty(getValidationMessage('required', { attribute }))

/**
 * Required UUID validation
 * @param attribute
 * @returns
 */
export const requiredUUID = (attribute: string) =>
  z.uuid(getValidationMessage('required', { attribute }))

/**
 * Required email validation
 * @param attribute
 * @returns
 */
export const requiredEmail = (attribute: string) =>
  z.email(getValidationMessage('email', { attribute }))

/**
 * Required password validation (minimum length 8)
 * @param attribute
 * @returns
 */
export const requiredPassword = (attribute: string) =>
  requiredString(attribute).min(8, getValidationMessage('min', { attribute, min: 8 }))
