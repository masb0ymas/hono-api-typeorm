import { AppDataSource } from '~/config/database'
import { Session } from '~/database/entities/session'

import BaseRepository from './base'

export default class SessionRepository extends BaseRepository<Session> {
  constructor() {
    super({
      repository: AppDataSource.getRepository(Session),
      model: 'sessions',
    })
  }
}
