// A real SQLite engine behind the small D1 surface the server uses, so the production SQL runs in tests.
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const schema = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');

export function memoryD1() {
  const db = new DatabaseSync(':memory:');
  db.exec(schema);
  const statement = (sql, values = []) => ({
    bind: (...next) => statement(sql, next),
    async first() { return db.prepare(sql).get(...values) ?? null; },
    async all() { return { results: db.prepare(sql).all(...values) }; },
    async run() { db.prepare(sql).run(...values); return {}; },
    execute() { return db.prepare(sql).all(...values); },
  });
  return {
    raw: db,
    prepare: (sql) => statement(sql),
    // D1 runs a batch as one transaction.
    async batch(statements) {
      db.exec('BEGIN');
      try { const results = statements.map((s) => ({ results: s.execute() })); db.exec('COMMIT'); return results; }
      catch (error) { db.exec('ROLLBACK'); throw error; }
    },
  };
}
