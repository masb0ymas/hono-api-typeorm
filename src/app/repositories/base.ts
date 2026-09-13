import {
  type DeepPartial,
  type EntityManager,
  type FindOneOptions,
  type FindOptionsWhere,
  In,
  type ObjectLiteral,
  type Repository,
  type SelectQueryBuilder,
} from 'typeorm'

import ErrorResponse from '~/lib/http/errors'
import { useQuery } from '~/lib/query'
import { validate } from '~/lib/validate'
import type { BaseServiceParams, DtoFindAll, FindParams } from '~/types/repository'

export default class BaseRepository<T extends ObjectLiteral> {
  public repository: Repository<T>
  protected _model: string
  private _entity: new () => T

  constructor({ repository, model, entity }: BaseServiceParams<T>) {
    this.repository = repository
    this._model = model
    this._entity = entity
  }

  /**
   * Repository bound to a transaction manager when one is given, so
   * multi-entity flows stay atomic.
   */
  protected scoped(manager?: EntityManager): Repository<T> {
    return manager ? manager.getRepository(this._entity) : this.repository
  }

  /**
   * Find all. `configure` customizes the query before pagination (e.g. joins).
   */
  async find(
    { offset, limit, filtered = [], sorted = [] }: FindParams,
    configure?: (query: SelectQueryBuilder<T>) => void,
    manager?: EntityManager
  ): Promise<DtoFindAll<T>> {
    const query = this.scoped(manager).createQueryBuilder(this._model)
    configure?.(query)

    const newQuery = useQuery({
      query,
      model: this._model,
      reqQuery: { offset, limit, filtered, sorted },
    })

    const [data, total] = await newQuery.getManyAndCount()

    return { data, total }
  }

  /**
   * Find one
   */
  protected async _findOne(options: FindOneOptions<T>, manager?: EntityManager): Promise<T> {
    const record = await this.scoped(manager).findOne(options)

    if (!record) {
      throw new ErrorResponse.NotFound(`${this._model} not found`)
    }

    return record
  }

  /**
   * Find by id
   */
  async findById(id: string, options?: FindOneOptions<T>, manager?: EntityManager): Promise<T> {
    const newId = validate.uuid(id)

    return this._findOne(
      { where: { id: newId } as unknown as FindOptionsWhere<T>, ...options },
      manager
    )
  }

  /**
   * Create
   */
  async create(data: DeepPartial<T>, manager?: EntityManager): Promise<T> {
    // `create` builds an entity instance so @BeforeInsert hooks (id generation,
    // password hashing) run; `save` alone would insert the raw object.
    return this.scoped(manager).save(this.scoped(manager).create(data))
  }

  /**
   * Update
   */
  async update(id: string, data: Partial<T>, manager?: EntityManager): Promise<T> {
    const record = await this.findById(id, undefined, manager)
    return this.scoped(manager).save(this.scoped(manager).merge(record, data as DeepPartial<T>))
  }

  /**
   * Restore
   */
  async restore(id: string, manager?: EntityManager) {
    const record = await this.findById(id, { withDeleted: true }, manager)
    await this.scoped(manager).restore(record.id)
  }

  /**
   * Soft delete
   */
  async softDelete(id: string, manager?: EntityManager) {
    const record = await this.findById(id, undefined, manager)
    await this.scoped(manager).softDelete(record.id)
  }

  /**
   * Force delete
   */
  async forceDelete(id: string, manager?: EntityManager) {
    const record = await this.findById(id, undefined, manager)
    await this.scoped(manager).delete(record.id)
  }

  /**
   * Multiple restore
   */
  async multipleRestore(ids: string[], manager?: EntityManager) {
    const newIds = this._validateIds(ids)

    await this.scoped(manager).restore({ id: In(newIds) } as unknown as FindOptionsWhere<T>)
  }

  /**
   * Multiple soft delete
   */
  async multipleSoftDelete(ids: string[], manager?: EntityManager) {
    const newIds = this._validateIds(ids)

    await this.scoped(manager).softDelete({ id: In(newIds) } as unknown as FindOptionsWhere<T>)
  }

  /**
   * Multiple force delete
   */
  async multipleForceDelete(ids: string[], manager?: EntityManager) {
    const newIds = this._validateIds(ids)

    await this.scoped(manager).delete({ id: In(newIds) } as unknown as FindOptionsWhere<T>)
  }

  /**
   * Validate ids
   */
  private _validateIds(ids: string[]): string[] {
    if (!ids || ids.length === 0) {
      throw new ErrorResponse.BadRequest('ids is required')
    }

    return ids.map(validate.uuid)
  }
}
