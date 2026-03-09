// ============================================================
// routes/schema.js — Live schema introspection from MySQL
// ============================================================

import { Router } from 'express';
import pool       from '../db.js';

const router = Router();

// In-memory cache (5-minute TTL) to avoid redundant introspection calls
let schemaCache    = null;
let schemaCachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Returns a compact, human-readable schema string for the system prompt.
 */
export async function getSchema() {
  if (schemaCache && Date.now() - schemaCachedAt < CACHE_TTL_MS) {
    return schemaCache;
  }

  const [tables] = await pool.query(`
    SELECT TABLE_NAME
    FROM   information_schema.TABLES
    WHERE  TABLE_SCHEMA = DATABASE()
      AND  TABLE_TYPE   = 'BASE TABLE'
    ORDER  BY TABLE_NAME
  `);

  const lines = [];

  for (const { TABLE_NAME } of tables) {
    const [cols] = await pool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
      FROM   information_schema.COLUMNS
      WHERE  TABLE_SCHEMA = DATABASE()
        AND  TABLE_NAME   = ?
      ORDER  BY ORDINAL_POSITION
    `, [TABLE_NAME]);

    const colDefs = cols.map((c) => {
      let def = `  ${c.COLUMN_NAME} ${c.COLUMN_TYPE}`;
      if (c.COLUMN_KEY === 'PRI') def += ' PK';
      if (c.IS_NULLABLE === 'NO') def += ' NOT NULL';
      return def;
    }).join(',\n');

    lines.push(`Table: ${TABLE_NAME}\n(\n${colDefs}\n)`);
  }

  schemaCache    = lines.join('\n\n');
  schemaCachedAt = Date.now();
  return schemaCache;
}

// ── GET /api/schema ──────────────────────────────────────────
router.get('/', async (_req, res, next) => {
  try {
    // Return structured metadata for the frontend schema explorer
    const [tables] = await pool.query(`
      SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME
      FROM   information_schema.TABLES
      WHERE  TABLE_SCHEMA = DATABASE()
        AND  TABLE_TYPE   = 'BASE TABLE'
      ORDER  BY TABLE_NAME
    `);

    const result = [];

    for (const t of tables) {
      const [cols] = await pool.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, EXTRA
        FROM   information_schema.COLUMNS
        WHERE  TABLE_SCHEMA = DATABASE()
          AND  TABLE_NAME   = ?
        ORDER  BY ORDINAL_POSITION
      `, [t.TABLE_NAME]);

      result.push({
        table:   t.TABLE_NAME,
        rows:    t.TABLE_ROWS,
        columns: cols.map((c) => ({
          name:       c.COLUMN_NAME,
          type:       c.COLUMN_TYPE,
          nullable:   c.IS_NULLABLE === 'YES',
          primaryKey: c.COLUMN_KEY === 'PRI',
          extra:      c.EXTRA,
        })),
      });
    }

    res.json({ schema: result });
  } catch (err) {
    next(err);
  }
});

export default router;
