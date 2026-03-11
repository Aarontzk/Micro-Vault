import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const rawUrl = process.env.DATABASE_URL || '';
const connectionString = rawUrl + (rawUrl.includes('?') ? '&' : '?') + 'connect_timeout=10';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 1,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 10000,
});

export default pool;