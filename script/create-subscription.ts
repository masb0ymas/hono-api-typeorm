import { execSync } from 'child_process'

const name = process.argv[2]

if (!name) {
  console.error('Error: subscribers name is required.\n')
  console.info('Usage: bun run db:create <subscribers-name>\n')
  process.exit(1)
}

const command = `typeorm subscriber:create src/database/subscribers/${name}`

console.log(`Executing: ${command}`)
execSync(command, { stdio: 'inherit' })
