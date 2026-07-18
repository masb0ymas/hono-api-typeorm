import type { Context } from 'hono'
import jwt from 'jsonwebtoken'

import { ms } from '../date'
import type { JwtTokenParams } from './types'

export default class JwtToken {
  private _secret: string
  private _expires: number
  private _expiresIn: number

  constructor({ secret, expires }: JwtTokenParams) {
    this._secret = secret
    this._expires = ms(expires)
    this._expiresIn = Number(this._expires) / 1000
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
    const queryToken = c.req.query('token')
    const headerToken = c.req.header('authorization')
    const cookieToken = c.req
      .header('cookie')
      ?.split(';')
      .find((cookie) => cookie.trim().startsWith('token='))
      ?.split('=')[1]

    if (queryToken) {
      console.log('Token extracted from query')
      return queryToken
    }

    if (cookieToken) {
      console.log('Token extracted from cookie')
      return cookieToken
    }

    if (headerToken) {
      const splitAuthorize = headerToken.split(' ')
      const allowedAuthorize = ['Bearer', 'JWT', 'Token']

      if (splitAuthorize.length !== 2 || !allowedAuthorize.includes(splitAuthorize[0])) {
        return null
      }

      console.log('Token extracted from header')
      return splitAuthorize[1]
    }

    console.log('Token not found')
    return null
  }

  /**
   * Verify a JWT token
   */
  verify(token: string) {
    try {
      if (!token) return { data: null, message: 'unauthorized, invalid token' }

      const decoded = jwt.verify(token, this._secret)
      return { data: decoded, message: 'success' }
    } catch (error: unknown) {
      if (error instanceof jwt.TokenExpiredError) {
        return { data: null, message: `unauthorized, token expired ${error.message || error}` }
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return { data: null, message: `unauthorized, invalid token ${error.message || error}` }
      }

      if (error instanceof jwt.NotBeforeError) {
        return { data: null, message: `unauthorized, token not before ${error.message || error}` }
      }

      return {
        data: null,
        message: `unauthorized, invalid token ${(error as Error).message || error}`,
      }
    }
  }
}
