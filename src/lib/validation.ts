import z from 'zod'

/**
 * Interpolate `:param` placeholders in a validation message template.
 */
const message = (template: string, params: Record<string, string | number>) =>
  template.replace(/:([a-zA-Z_]+)/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `:${key}`
  )

export const requiredString = (attribute: string) =>
  z.string().nonempty(message('The :attribute field is required.', { attribute }))

export const requiredUUID = (attribute: string) =>
  z.uuid(message('The :attribute field is required.', { attribute }))

export const requiredEmail = (attribute: string) =>
  z.email(message('The :attribute must be a valid email address.', { attribute }))

export const requiredPassword = (attribute: string) =>
  requiredString(attribute).min(
    8,
    message('The :attribute must be at least :min characters.', { attribute, min: 8 })
  )
