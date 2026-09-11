import '@dotenvx/dotenvx/config'

import z from 'zod'

export const ConfigSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test', 'staging']),
    MACHINE_ID: z.string(),
    DEBUG: z.stringbool().default(false),
    PORT: z.coerce.number().int().default(8080),

    APP_NAME: z.string(),
    APP_URL: z.string(),
    APP_DEFAULT_PASS: z.string(),

    JWT_SECRET: z.string(),
    JWT_EXPIRES: z.string(),

    TYPEORM_CONNECTION: z.enum(['mysql', 'postgres', 'sqlite']),
    TYPEORM_HOST: z.string(),
    TYPEORM_PORT: z.coerce.number().int(),
    TYPEORM_USERNAME: z.string(),
    TYPEORM_PASSWORD: z.string(),
    TYPEORM_DATABASE: z.string(),
    // stringbool, not coerce.boolean: "false" and "0" must be false, not the
    // truthy string JS would otherwise coerce them to.
    TYPEORM_SYNCHRONIZE: z.stringbool(),
    TYPEORM_LOGGING: z.stringbool(),
    TYPEORM_MIGRATIONS_RUN: z.stringbool(),
    TYPEORM_TIMEZONE: z.string(),
  })
  .transform((val) => {
    return {
      app: {
        nodeEnv: val.NODE_ENV,
        debug: val.DEBUG,
        machineId: val.MACHINE_ID,
        port: val.PORT,
        name: val.APP_NAME,
        url: val.APP_URL,
        defaultPass: val.APP_DEFAULT_PASS,
      },
      jwt: {
        secret: val.JWT_SECRET,
        expires: val.JWT_EXPIRES,
      },
      typeorm: {
        connection: val.TYPEORM_CONNECTION,
        host: val.TYPEORM_HOST,
        port: val.TYPEORM_PORT,
        username: val.TYPEORM_USERNAME,
        password: val.TYPEORM_PASSWORD,
        database: val.TYPEORM_DATABASE,
        synchronize: val.TYPEORM_SYNCHRONIZE,
        logging: val.TYPEORM_LOGGING,
        migrationsRun: val.TYPEORM_MIGRATIONS_RUN,
        timezone: val.TYPEORM_TIMEZONE,
      },
    }
  })
  .readonly()

export type Config = z.infer<typeof ConfigSchema>
export type AppConfig = Config['app']
export type JwtConfig = Config['jwt']
export type TypeormConfig = Config['typeorm']

const parsed = ConfigSchema.safeParse(process.env)

if (!parsed.success) {
  console.error(parsed.error)
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
