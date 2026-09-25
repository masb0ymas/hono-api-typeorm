import type { Context } from 'hono'
import jwt, { type JwtPayload } from 'jsonwebtoken'

import { ms } from '../date'
import type { JwtTokenParams } from './types'

export type JwtVerifyResult = {
  data: JwtPayload | null
  message: string
}

export default class JwtToken {
  private _secret: string
  private _expiresIn: number

  constructor({ secret, expires }: JwtTokenParams) {
    this._secret = secret
    this._expiresIn = ms(expires) / 1000
  }

  /**
   * Generate a JWT token
   */
  generate(payload: Record<string, unknown>) {
    const token = jwt.sign(payload, this._secret, { expiresIn: this._expiresIn })
    return { token, expiresIn: this._expiresIn }
  }

  /**
   * Extract token from request
   */
  extract(c: Context): string | null {
    const headerToken = c.req.header('authorization')
    const cookieToken = c.req
      .header('cookie')
      ?.split(';')
      .find((cookie) => cookie.trim().startsWith('token='))
      ?.split('=')[1]

    if (cookieToken) return cookieToken

    if (headerToken) {
      const splitAuthorize = headerToken.split(' ')
      const allowedAuthorize = ['Bearer', 'JWT', 'Token']

      if (splitAuthorize.length !== 2 || !allowedAuthorize.includes(splitAuthorize[0])) {
        return null
      }

      return splitAuthorize[1]
    }

    return null
  }

  /**
   * Verify a JWT token
   */
  verify(token: string): JwtVerifyResult {
    try {
      const decoded = jwt.verify(token, this._secret)

      if (typeof decoded === 'string') {
        return { data: null, message: 'unauthorized, invalid token payload' }
      }

      return { data: decoded, message: 'success' }
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error)
      return { data: null, message: `unauthorized, invalid token ${reason}` }
    }
  }
}
