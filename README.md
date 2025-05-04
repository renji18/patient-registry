# Patient Registry App

A lightweight React TS + Vite application for registering and managing patient data using an in-browser SQLite database powered by [`@electric-sql/pglite`](https://electric-sql.com/docs/pglite).

Deployed on vercel: https://patient-registry-zeta.vercel.app/

---

## Features

- Register new patients.
- Query patient records using SQL.
- Persist patient data across page refreshes.
- Support usage in multiple browser tabs simultaneously.

---

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Database**: [`@electric-sql/pglite`](https://electric-sql.com/docs/pglite)
- **Storage**: IndexedDB-backed SQLite
- **Tooling**: Tailwind CSS, Sonner (toast notifications)

---

## Installation

```code
git clone https://github.com/renji18/patient-registry.git
cd patient-registry
npm install
```

## Development

```code
npm run dev
```

Visit: http://localhost:5173

---

## 🗃️ Local Database

Used [`@electric-sql/pglite`](https://electric-sql.com/docs/pglite) to persist SQLite data directly in the browser using IndexedDB.

On first load, the database is initialized with the following schema:

```sql
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  contact TEXT
);
```

This schema ensures persistence and consistent structure even across page reloads or browser restarts.

---

## Challenges Faced: Multi-Tab Sync with PGlite

### Requirement

This project required **local database consistency across multiple browser tabs** — meaning if I updated patient data in one tab, it should immediately reflect in others.

###  Initial Setup with PGlite

I used [`PGlite`](https://electric-sql.com/docs/usage/pglite) for browser-based SQLite storage. However, PGlite allows only a **single writable connection** to the database at any time — meaning **multiple tabs can't safely access it directly**, which led to several issues.


### First Attempt: `BroadcastChannel` for Manual Sync

My initial solution was to use [`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) to broadcast update events across tabs. My custom `runQuery()` function:

- Detected if the SQL query was a mutation (`INSERT`, `UPDATE`, `DELETE`)
- Executed the query locally
- Broadcast a `{ type: 'patient-updated' }` message on mutation
- Other tabs listened to this and reloaded the data accordingly

While this worked on the surface, it had critical problems:
- Each tab still opened its **own PGlite connection**
- This violated PGlite’s single-connection model
- Resulted in **race conditions**, **query failures**, and **IndexedDB locking issues**

---

###  Finalized Solution: Web Worker-based DB Access

To overcome this, I implemented a **dedicated Web Worker-based setup** using `@electric-sql/pglite/worker`. This design offloads all database access to a background thread, and **all tabs communicate with this shared worker**, ensuring consistent access to a single database connection.

### Why this works:
- The **database connection lives inside the worker** — isolated from the UI
- All reads/writes go through the **same thread**, avoiding IndexedDB conflicts
- Tabs send queries to the worker instead of using PGlite directly
- **All tabs talk to the same worker instance**, ensuring consistency and avoiding locking conflicts.
- Mutations can still broadcast update events using `BroadcastChannel`.
- Perfect separation of DB logic and UI.

###  Worker Setup Overview

- `worker.js` creates the PGlite instance and sets up the schema inside a web worker
- `db.ts` initializes the `PGliteWorker` and exposes a `db` instance and `initDB()` helper
- All reads and writes go through `runQuery()` in `dbUtil.ts` instead of directly using the `db` instance.
- Mutations post update messages so other tabs refresh.

```ts
// worker.js
import {PGlite} from '@electric-sql/pglite'
import {worker} from '@electric-sql/pglite/worker'

worker({
  async init() {
    return new PGlite('idb://aadarsh-patient-registry')
  },
})
```

---