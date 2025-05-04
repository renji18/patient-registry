import {PGliteWorker} from "@electric-sql/pglite/worker";
import {TABLE_NAME} from "../utils/constants.ts";

const db = new PGliteWorker(
  new Worker(new URL('./worker.js', import.meta.url), {
    type: 'module',
  }),
)

export async function initDB() {
  if (!db) return
  await db.exec(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME}
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