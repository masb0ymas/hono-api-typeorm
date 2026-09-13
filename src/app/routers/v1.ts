import { Hono } from 'hono'

import HttpResponse from '~/lib/http/response'

import { AuthHandler } from '../handlers/auth'
import { RoleHandler } from '../handlers/role'
import { SessionHandler } from '../handlers/session'
import { UserHandler } from '../handlers/user'

const v1Router = new Hono()

v1Router.get('/', (c) => {
  const response = HttpResponse.get({ data: { status: 'v1' } })
  return c.json(response)
})

v1Router.route('/auth', AuthHandler)

v1Router.route('/roles', RoleHandler)
v1Router.route('/users', UserHandler)
v1Router.route('/sessions', SessionHandler)

export default v1Router
