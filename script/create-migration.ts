import { execSync } from 'child_process'

const name = process.argv[2]

if (!name) {
  console.error('Error: migration name is required.\n')
  console.info('Usage: bun run db:create <migration-name>\n')
  process.exit(1)
}

const command = `typeorm migration:create src/database/migrations/${name}`

console.log(`Executing: ${command}`)
execSync(command, { stdio: 'inherit' })
