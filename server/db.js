// ============================================================
// db.js — MySQL 9.1 Connection Pool (mysql2/promise)
// ============================================================

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     ?? 'localhost',
  port:               Number(process.env.DB_PORT ?? 3306),
  user:               process.env.DB_USER     ?? 'root',
  password:           process.env.DB_PASSWORD ?? '',
  database:           process.env.DB_NAME     ?? 'txt2sql_demo',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
  // MySQL 9 uses caching_sha2_password by default
  authPlugins: {
    caching_sha2_password: () => () => Buffer.from(`${process.env.DB_PASSWORD ?? ''}\0`),
  },
});

/**
 * Verifies the pool can reach MySQL on startup.
 */
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    const [[{ version }]] = await conn.query('SELECT VERSION() AS version');
    conn.release();
    console.log(`✅  MySQL connected — server version: ${version}`);
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message);
    throw err;
  }
}

/**
 * Executes a SELECT query safely against the pool.
 * Throws if the query is not a read-only SELECT statement.
 */
export async function safeQuery(sql, params = []) {
  const trimmed = sql.trim().toUpperCase();
  const ALLOWED_PREFIXES = ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN', 'INSERT', 'UPDATE', 'DELETE'];

  if (!ALLOWED_PREFIXES.some((p) => trimmed.startsWith(p))) {
    throw Object.assign(
      new Error('Only SELECT, INSERT, UPDATE and DELETE statements are permitted.'),
      { code: 'INVALID_QUERY', status: 400 }
    );
  }

  const [rows, fields] = await pool.execute(sql, params);
  return { rows, fields };
}

export default pool;
