const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function createDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const sql = fs.readFileSync(
    path.join(__dirname, '../prisma/migrations/init_migration.sql'),
    'utf8'
  );

  try {
    await pool.query(sql);
    console.log('✅ Database tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createDatabase();

