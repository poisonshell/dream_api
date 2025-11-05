const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const MAX_RETRIES = 30;
const RETRY_DELAY = 1000; // 1 second

async function waitForPostgres() {
  console.log('⏳ Waiting for PostgreSQL to be ready...');

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const { stdout } = await execAsync(
        'docker compose exec -T postgres pg_isready -U postgres'
      );
      
      if (stdout.includes('accepting connections')) {
        console.log('✅ PostgreSQL is ready!');
        return;
      }
    } catch (error) {
      // PostgreSQL not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    process.stdout.write('.');
  }

  console.error('\n❌ PostgreSQL failed to start within expected time');
  process.exit(1);
}

waitForPostgres().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
