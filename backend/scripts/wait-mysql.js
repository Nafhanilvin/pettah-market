const mysql = require('mysql2/promise');

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const maxAttempts = 30;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const connection = await mysql.createConnection(DATABASE_URL);
      await connection.query('SELECT 1');
      await connection.end();
      console.log('✅ MySQL is ready');
      return;
    } catch (error) {
      process.stdout.write(`⏳ Waiting for MySQL... (${attempt}/${maxAttempts})\r`);
      await wait(2000);
    }
  }

  console.error('\n❌ MySQL did not become ready in time');
  process.exit(1);
}

main();
