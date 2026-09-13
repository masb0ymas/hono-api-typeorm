import type { EntityManager } from 'typeorm'

import { AppDataSource } from '~/config/database'
import { RefreshToken } from '~/database/entities/refresh_tokens'

import BaseRepository from './base'

export default class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor(manager?: EntityManager) {
    super({
      repository: (manager ?? AppDataSource).getRepository(RefreshToken),
      model: 'refresh_tokens',
      entity: RefreshToken,
    })
  }

  /**
   * Find a refresh token by its value (the /refresh credential)
   */
  async findByToken(token: string, manager?: EntityManager): Promise<RefreshToken | null> {
    return await this.scoped(manager).findOne({ where: { token } })
  }

  /**
   * Revoke every refresh token issued for a session
   */
  async deleteByIdToken(idToken: string, manager?: EntityManager) {
    await this.scoped(manager).delete({ id_token: idToken })
  }
}
