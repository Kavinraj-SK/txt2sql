# txt2sql 🔍

> **Natural-language to MySQL query engine** — powered by Claude AI.

![Node](https://img.shields.io/badge/Node.js-≥20-339933?logo=nodedotjs)
![MySQL](https://img.shields.io/badge/MySQL-9.1-4479A1?logo=mysql)
![Claude](https://img.shields.io/badge/Claude-Sonnet--4-D97757?logo=anthropic)

---

## Features

- **NL → SQL** — Converts plain English questions into valid MySQL 9.1 SELECT statements via Claude AI
- **Multi-turn context** — Maintains conversation history for follow-up queries
- **Live schema introspection** — Reads your real MySQL schema on startup; always up-to-date
- **Read-only enforcement** — Only SELECT / SHOW / DESCRIBE / EXPLAIN queries are permitted
- **Query history** — Tracks recent queries in-session (swappable for a DB table)
- **Rate limiting + Helmet** — Production-ready security middleware

---

## Tech Stack

| Layer    | Technology                         |
|----------|------------------------------------|
| AI       | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Backend  | Node.js 20 + Express 4             |
| Database | MySQL 9.1 (`mysql2` driver)        |
| Frontend | React 18 + Vite                    |

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-username/txt2sql.git
cd txt2sql
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MySQL credentials and Anthropic API key
```

### 3. Set Up the Database

```bash
# Make sure MySQL 9.1 is running, then:
npm run db:setup
```

### 4. Run in Development

```bash
npm run dev          # starts both server (port 4000) and Vite client (port 5173)
```

---

## API Reference

### `POST /api/query`

Converts a natural-language question to SQL and executes it.

**Request body:**
```json
{
  "question": "Show all employees earning over $100k",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "question": "Show all employees earning over $100k",
  "sql": "SELECT * FROM employees WHERE salary > 100000 LIMIT 200",
  "columns": [{ "name": "id", "type": 3, "table": "employees" }],
  "rows": [...],
  "rowCount": 4,
  "meta": {
    "claudeMs": 412,
    "dbMs": 8,
    "model": "claude-sonnet-4-20250514",
    "inputTokens": 320,
    "outputTokens": 28
  }
}
```

### `GET /api/schema`

Returns the full database schema as structured JSON.

### `GET /api/history`

Returns the last 20 queries run in this session.

### `DELETE /api/history`

Clears query history.

---

## Project Structure

```
txt2sql/
├── server/
│   ├── index.js              # Express app bootstrap
│   ├── db.js                 # MySQL pool + safeQuery()
│   ├── routes/
│   │   ├── query.js          # NL → SQL → execute pipeline
│   │   ├── schema.js         # Schema introspection + cache
│   │   └── history.js        # Session history
│   └── middleware/
│       ├── errorHandler.js
│       └── requestLogger.js
├── client/
│   └── src/
│       └── App.jsx           # React frontend
├── database/
│   ├── schema.sql            # Table definitions
│   └── seed.sql              # Sample data
├── .env.example
└── package.json
```

---

## Security Considerations

- All SQL is validated against an **allowlist** of read-only prefixes before execution
- Express **Helmet** sets secure HTTP headers
- **Rate limiting** — 30 requests per minute per IP
- API keys are stored in `.env` and never exposed to the client

---

## License

MIT
