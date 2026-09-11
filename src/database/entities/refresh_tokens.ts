import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  type Relation,
} from 'typeorm'

import { Base } from './base'
import { User } from './users'

@Entity({ name: 'refresh_tokens' })
export class RefreshToken extends Base {
  @Index()
  @DeleteDateColumn({ nullable: true })
  deleted_at!: Date

  @Column({ type: 'uuid' })
  user_id: string

  @Column({ type: 'text' })
  token: string

  @Column({ type: 'text' })
  id_token: string

  // bigint columns come back from node-postgres as strings.
  @Column({ type: 'bigint' })
  expires_in: string

  @Column({ type: 'timestamp' })
  expires_at: Date

  @ManyToOne(() => User, (user) => user.refresh_tokens)
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>
}
