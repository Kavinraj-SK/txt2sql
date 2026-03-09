# txt2sql 🔍

> **Natural-language to MySQL query engine** — powered by Groq AI (Llama 3.3).

![Node](https://img.shields.io/badge/Node.js-≥20-339933?logo=nodedotjs)
![MySQL](https://img.shields.io/badge/MySQL-9.1-4479A1?logo=mysql)
![Groq](https://img.shields.io/badge/Groq-Llama3.3-F55036)

---

## Features

- **NL → SQL** — Converts plain English into MySQL 9.1 queries via Groq AI
- **Full CRUD** — SELECT, INSERT, UPDATE, DELETE all supported
- **Multi-turn context** — Follow-up queries remember previous context
- **Live schema introspection** — Reads your real MySQL schema automatically
- **Query history** — Tracks recent queries in-session
- **Read + Write safety** — Blocks dangerous DDL statements (DROP, TRUNCATE etc.)

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| AI       | Groq API (llama-3.3-70b-versatile)|
| Backend  | Node.js 20 + Express 4            |
| Database | MySQL 9.1 (`mysql2` driver)       |
| Frontend | React 18 + Vite                   |

---

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Kavinraj-SK/txt2sql.git
cd txt2sql
npm install
npm install react react-dom
```

### 2. Configure Environment
```bash
copy .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=txt2sql_demo
```

Get your free Groq API key at **console.groq.com**

### 3. Start MySQL (Windows)

Open **PowerShell as Administrator** and run:
```powershell
& "C:\Program Files\MySQL\MySQL Server 9.1\bin\mysqld.exe" --console
```

Keep this window open while using the app.

### 4. Set Up the Database

Open a new terminal and run:
```bash
mysql -u root
```

Then inside MySQL:
```sql
source database/schema.sql
source database/seed.sql
exit
```

### 5. Start the App
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Example Queries

- "Show all employees earning more than $100k"
- "Add a new employee John Doe in Engineering with salary 70000"
- "Update Alice Johnson's salary to 135000"
- "Delete the order with id 11"
- "What is the average salary per department?"
- "Count orders by status"

---

## Project Structure
```
txt2sql/
├── server/
│   ├── index.js              # Express app
│   ├── db.js                 # MySQL pool + safeQuery()
│   └── routes/
│       ├── query.js          # NL → SQL → execute pipeline
│       ├── schema.js         # Schema introspection
│       └── history.js        # Session history
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

## License

MIT
