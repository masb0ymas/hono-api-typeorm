import { Column, Entity, Index, JoinColumn, ManyToOne, type Relation } from 'typeorm'

import { Base } from './base'
import { User } from './users'

@Entity({ name: 'sessions' })
export class Session extends Base {
  @Index()
  @Column({ type: 'uuid' })
  user_id: string

  @Index()
  @Column({ type: 'text' })
  token: string

  @Column({ nullable: true })
  ip_address!: string

  @Column({ nullable: true })
  device!: string

  @Column({ nullable: true })
  platform!: string

  @Column({ type: 'text', nullable: true })
  user_agent!: string

  @Column({ nullable: true })
  latitude!: string

  @Column({ nullable: true })
  longitude!: string

  // bigint columns come back from node-postgres as strings.
  @Column({ type: 'bigint' })
  expires_in: string

  @Column({ type: 'timestamp' })
  expires_at: Date

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>
}
