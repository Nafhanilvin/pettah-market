const { execSync } = require('child_process');

const run = (command, label) => {
  console.log(`\n▶ ${label}`);
  execSync(command, { stdio: 'inherit' });
};

try {
  run('npm run prisma:generate', 'Generating Prisma client');
  run('npm run prisma:push', 'Syncing schema to MySQL');
  run('npm run db:seed', 'Seeding starter data');
  console.log('\n✅ Easy setup complete. Start server with: npm run dev');
} catch (error) {
  console.error('\n❌ Easy setup failed. Check DATABASE_URL or start MySQL (npm run db:up).');
  process.exit(1);
}
