import { AppDataSource } from '~/config/database'
import { RefreshToken } from '~/database/entities/refresh_tokens'

import BaseRepository from './base'

export default class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor() {
    super({
      repository: AppDataSource.getRepository(RefreshToken),
      model: 'refresh_tokens',
    })
  }

  /**
   * Find a user's refresh token by its value
   */
  async findByToken(userId: string, token: string): Promise<RefreshToken | null> {
    return await this.repository.findOne({ where: { user_id: userId, token } })
  }
}
