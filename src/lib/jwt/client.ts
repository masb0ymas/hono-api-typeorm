import { env } from '~/config/env'

import JwtToken from '.'

/**
 * Application JWT client, configured from the environment.
 * `JWT_EXPIRES` controls the access-token lifetime.
 */
const jwt = new JwtToken({
  secret: env.jwt.secret,
  expires: env.jwt.expires,
})

export default jwt
