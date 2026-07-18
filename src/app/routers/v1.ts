import { Hono } from 'hono'

import { AuthHandler } from '../handlers/auth'
import { RoleHandler } from '../handlers/role'
import { SessionHandler } from '../handlers/session'
import { UserHandler } from '../handlers/user'

const v1Router = new Hono()

v1Router.get('/', (c) => {
  return c.json({ status: 'v1' })
})

v1Router.route('/auth', AuthHandler)

v1Router.route('/roles', RoleHandler)
v1Router.route('/users', UserHandler)
v1Router.route('/sessions', SessionHandler)

export default v1Router
