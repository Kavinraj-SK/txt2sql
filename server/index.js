// ============================================================
// TXT2SQL — Express Server Entry Point
// Node.js + Express + MySQL 9.1 + Anthropic Claude API
// ============================================================

import express       from 'express';
import cors          from 'cors';
import helmet        from 'helmet';
import rateLimit     from 'express-rate-limit';
import dotenv        from 'dotenv';
import { testConnection } from './db.js';
import queryRouter   from './routes/query.js';
import schemaRouter  from './routes/schema.js';
import historyRouter from './routes/history.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  methods: ['GET', 'POST'],
}));

// ── Rate Limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max:      30,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests — please wait a moment.' },
});
app.use('/api/', limiter);

// ── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Logging ──────────────────────────────────────────────────
app.use(requestLogger);

// ── Routes ───────────────────────────────────────────────────
app.use('/api/query',   queryRouter);
app.use('/api/schema',  schemaRouter);
app.use('/api/history', historyRouter);

// ── Health Check ─────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── Bootstrap ────────────────────────────────────────────────
async function bootstrap() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n🚀  TXT2SQL server running on http://localhost:${PORT}`);
    console.log(`📡  MySQL connected to ${process.env.DB_HOST}:${process.env.DB_PORT ?? 3306}`);
    console.log(`🤖  Claude model: ${process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-20250514'}\n`);
  });
}

bootstrap().catch((err) => {
  console.error('❌  Server startup failed:', err.message);
  process.exit(1);
});
