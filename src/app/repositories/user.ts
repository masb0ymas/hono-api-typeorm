import { AppDataSource } from '~/config/database'
import { User } from '~/database/entities/users'
import { useQuery } from '~/lib/query'
import type { DtoFindAll, FindParams } from '~/types/repository'

import BaseRepository from './base'

export default class UserRepository extends BaseRepository<User> {
  constructor() {
    super({
      repository: AppDataSource.getRepository(User),
      model: 'users',
    })
  }

  /**
   * Find users with their role
   * @param params Find parameters
   * @returns Users with the role relation loaded
   */
  async findWithRelations({
    offset,
    limit,
    filtered = [],
    sorted = [],
  }: FindParams): Promise<DtoFindAll<User>> {
    const query = this.repository
      .createQueryBuilder(this._model)
      .leftJoinAndSelect(`${this._model}.role`, 'role')

    const newQuery = useQuery({
      query,
      model: this._model,
      reqQuery: { offset, limit, filtered, sorted },
    })

    const data = await newQuery.getMany()
    const total = await newQuery.getCount()

    return { data, total }
  }
}
