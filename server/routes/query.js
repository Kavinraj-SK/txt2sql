// ============================================================
// routes/query.js — Text → SQL → Execute pipeline (Groq)
// ============================================================

import { Router }      from 'express';
import { safeQuery }   from '../db.js';
import { getSchema }   from './schema.js';
import { saveHistory } from './history.js';

const router = Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = process.env.GROQ_MODEL ?? 'llama3-70b-8192';

// ── System Prompt ────────────────────────────────────────────
function buildSystemPrompt(schemaText) {
  return `You are an expert MySQL 9.1 query generator.

Given a natural-language request, produce ONLY a valid, executable MySQL statement.

Rules:
- Output ONLY raw SQL. No markdown, no backticks, no explanations, no comments.
- Use only tables and columns that exist in the schema below.
- For SELECT: Limit results to 200 rows unless the user specifies otherwise.
- For INSERT: Use proper INSERT INTO ... VALUES syntax.
- For UPDATE: ALWAYS include a WHERE clause. Never update all rows blindly.
- For DELETE: ALWAYS include a WHERE clause. Never delete all rows blindly.
- Never generate DROP, TRUNCATE, ALTER, CREATE, or any DDL statements.
- If the request cannot be fulfilled from the schema, output exactly: UNSUPPORTED_QUERY

DATABASE SCHEMA:
${schemaText}`;
}

// ── POST /api/query ──────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { question, conversationHistory = [] } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'question is required.' });
    }
    if (question.length > 500) {
      return res.status(400).json({ error: 'question must be ≤ 500 characters.' });
    }

    // ── 1. Fetch live schema ─────────────────────────────────
    const schemaText = await getSchema();

    // ── 2. Build message history (multi-turn support) ────────
    const messages = [
      ...conversationHistory.slice(-10), // keep last 10 turns for context
      { role: 'user', content: question },
    ];

    // ── 3. Call Groq API ─────────────────────────────────────
    const groqStart = Date.now();
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:       GROQ_MODEL,
        max_tokens:  512,
        temperature: 0.1,
        messages: [
          { role: 'system', content: buildSystemPrompt(schemaText) },
          ...messages,
        ],
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      throw Object.assign(new Error(err?.error?.message ?? 'Groq API error'), { status: 502 });
    }

    const groqData     = await groqRes.json();
    const groqMs       = Date.now() - groqStart;
    const generatedSQL = groqData.choices?.[0]?.message?.content?.trim() ?? '';

    if (!generatedSQL || generatedSQL === 'UNSUPPORTED_QUERY') {
      return res.status(422).json({
        error: 'The question could not be translated into a supported SQL query.',
        generatedSQL: null,
      });
    }

    // ── 4. Execute against MySQL ─────────────────────────────
    const dbStart = Date.now();
    const { rows, fields } = await safeQuery(generatedSQL);
    const dbMs = Date.now() - dbStart;

    // ── 5. Persist to history ────────────────────────────────
    await saveHistory({ question, sql: generatedSQL, rowCount: Array.isArray(rows) ? rows.length : 0 });

    // ── 6. Detect query type ─────────────────────────────────
    const queryType = generatedSQL.trim().toUpperCase().split(' ')[0];
    const isWrite   = ['INSERT','UPDATE','DELETE'].includes(queryType);

    // ── 7. Shape response ────────────────────────────────────
    const columns = isWrite ? [] : fields.map((f) => ({
      name:  f.name,
      type:  f.type,
      table: f.table ?? null,
    }));

    return res.json({
      question,
      sql:          generatedSQL,
      queryType,
      columns,
      rows:         isWrite ? [] : rows,
      rowCount:     isWrite ? null : rows.length,
      affectedRows: isWrite ? (rows.affectedRows ?? 0) : null,
      meta: {
        groqMs,
        dbMs,
        model:        GROQ_MODEL,
        inputTokens:  groqData.usage?.prompt_tokens,
        outputTokens: groqData.usage?.completion_tokens,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
