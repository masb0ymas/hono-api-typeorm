import { AppDataSource } from '~/config/database'
import { User } from '~/database/entities/user'
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
   * Find users with relations
   * @param params Find parameters
   * @returns Users with relations
   */
  async findWithRelations({
    offset,
    limit,
    filtered = [],
    sorted = [],
  }: FindParams): Promise<DtoFindAll<User>> {
    const query = this.repository
      .createQueryBuilder(this._model)
      .leftJoinAndSelect(`${this._model}.roles`, 'r')

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
