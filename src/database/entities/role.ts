import { Column, DeleteDateColumn, Entity, Index } from 'typeorm'

import { Base } from './base'

@Entity({ name: 'roles' })
export class Role extends Base {
  @Index()
  @DeleteDateColumn({ nullable: true })
  deleted_at!: Date

  @Index()
  @Column()
  name: string
}
