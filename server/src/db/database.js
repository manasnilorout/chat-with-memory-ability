import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/employees.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
  );

  CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
  CREATE INDEX IF NOT EXISTS idx_chat_sessions_employee_id ON chat_sessions(employee_id);
  CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
`);

// Employee operations
export const employeeDb = {
  create: (employeeId, name, email, department = null) => {
    const stmt = db.prepare(`
      INSERT INTO employees (employee_id, name, email, department)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(employeeId, name, email, department);
  },

  findByEmployeeId: (employeeId) => {
    const stmt = db.prepare('SELECT * FROM employees WHERE employee_id = ?');
    return stmt.get(employeeId);
  },

  update: (employeeId, updates) => {
    const fields = [];
    const values = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.department !== undefined) {
      fields.push('department = ?');
      values.push(updates.department);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(employeeId);

    const stmt = db.prepare(`
      UPDATE employees SET ${fields.join(', ')} WHERE employee_id = ?
    `);
    return stmt.run(...values);
  },

  getAll: () => {
    const stmt = db.prepare('SELECT * FROM employees ORDER BY created_at DESC');
    return stmt.all();
  }
};

// Chat session operations
export const chatDb = {
  createSession: (employeeId) => {
    const stmt = db.prepare(`
      INSERT INTO chat_sessions (employee_id) VALUES (?)
    `);
    const result = stmt.run(employeeId);
    return result.lastInsertRowid;
  },

  getLatestSession: (employeeId) => {
    const stmt = db.prepare(`
      SELECT * FROM chat_sessions
      WHERE employee_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);
    return stmt.get(employeeId);
  },

  addMessage: (sessionId, role, content) => {
    const stmt = db.prepare(`
      INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)
    `);
    return stmt.run(sessionId, role, content);
  },

  getSessionMessages: (sessionId, limit = 50) => {
    const stmt = db.prepare(`
      SELECT * FROM chat_messages
      WHERE session_id = ?
      ORDER BY created_at ASC
      LIMIT ?
    `);
    return stmt.all(sessionId, limit);
  },

  getRecentMessages: (employeeId, limit = 10) => {
    const stmt = db.prepare(`
      SELECT cm.* FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cs.employee_id = ?
      ORDER BY cm.created_at DESC
      LIMIT ?
    `);
    return stmt.all(employeeId, limit).reverse();
  }
};

export default db;
