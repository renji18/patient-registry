import {PGliteWorker} from "@electric-sql/pglite/worker";

const db = new PGliteWorker(
  new Worker(new URL('./worker.js', import.meta.url), {
    type: 'module',
  }),
)

export async function initDB() {
  if (!db) return
  await db.exec(`
      CREATE TABLE IF NOT EXISTS patients
      (
          id      SERIAL PRIMARY KEY,
          name    TEXT NOT NULL,
          age     INTEGER,
          gender  TEXT,
          contact TEXT
      );
  `);
}

export default db;