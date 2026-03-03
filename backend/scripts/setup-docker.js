const { execSync } = require('child_process');

const run = (command, label) => {
  console.log(`\n▶ ${label}`);
  execSync(command, { stdio: 'inherit' });
};

const hasDocker = () => {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    execSync('docker compose version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

if (!hasDocker()) {
  console.error('\n❌ Docker is not installed or Docker Compose is unavailable.');
  console.error('Install Docker Desktop, then rerun: npm run setup:docker');
  console.error('Or use local MySQL and run: npm run setup:easy');
  process.exit(1);
}

try {
  run('npm run db:up', 'Starting MySQL container');
  run('npm run db:wait', 'Waiting for MySQL to become healthy');
  run('npm run setup:easy', 'Generating client, syncing schema, and seeding');
  console.log('\n✅ Docker setup complete. Start server with: npm run dev');
} catch {
  console.error('\n❌ Docker setup failed. Check Docker status and backend logs.');
  process.exit(1);
}
