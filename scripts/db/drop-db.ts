import { execSync } from 'child_process'

function run(cmd: string) {
  console.log('> ' + cmd)
  try {
    execSync(cmd, { stdio: 'inherit', shell: true })
  } catch (err) {
    console.error('Command failed:', err instanceof Error ? err.message : String(err))
    process.exitCode = 1
  }
}

// Terminate other connections to the `payload` DB, then drop it.
const composeFile = 'docker-compose.postgres.yml'

run(
  `docker-compose -f ${composeFile} exec -T postgres psql -U payload -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='payload' AND pid <> pg_backend_pid();"`,
)
run(
  `docker-compose -f ${composeFile} exec -T postgres psql -U payload -d postgres -c "DROP DATABASE IF EXISTS payload;"`,
)

console.log('Finished drop-db script')
