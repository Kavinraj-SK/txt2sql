// ============================================================
// routes/history.js — In-memory query history (last 50 items)
// Swap the in-memory store for a DB table in production.
// ============================================================

import { Router } from 'express';

const router  = Router();
const history = [];   // [ { id, question, sql, rowCount, createdAt } ]
const MAX     = 50;
let   nextId  = 1;

export function saveHistory({ question, sql, rowCount }) {
  history.unshift({
    id:        nextId++,
    question,
    sql,
    rowCount,
    createdAt: new Date().toISOString(),
  });
  if (history.length > MAX) history.length = MAX;
}

// GET /api/history
router.get('/', (_req, res) => {
  res.json({ history: history.slice(0, 20) });
});

// DELETE /api/history
router.delete('/', (_req, res) => {
  history.length = 0;
  nextId = 1;
  res.json({ message: 'History cleared.' });
});

export default router;
