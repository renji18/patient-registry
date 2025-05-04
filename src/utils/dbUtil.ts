import {toast} from "sonner";
import db, {initDB} from "../lib/db.ts";
import {BROADCAST_CHANNEL, BROADCAST_UPDATE_MESSAGE, TABLE_NAME} from "./constants.ts";

const channel = new BroadcastChannel(BROADCAST_CHANNEL);

function isMutatingQuery(query: string): boolean {
  return /^(INSERT|UPDATE|DELETE|REPLACE)\b/i.test(query.trim());
}

export async function runQuery<T = never>(query: string, params: unknown[] = []): Promise<T[] | null> {
  try {
    if (!db) throw new Error('Database not found');

    const result = await db.query(query, params);

    if (isMutatingQuery(query)) {
      channel.postMessage({type: BROADCAST_UPDATE_MESSAGE});
    }

    toast.success("Query successful");
    return result.rows as T[];
  } catch (error: unknown) {
    console.error("Database query failed:", error);

    if (String(error) === `Error: relation "${TABLE_NAME}" does not exist`) {
      toast.warning(`Table "${TABLE_NAME}" doesn't exist. Creating...`);
      initDB()
        .then(() => runQuery(query, params))
        .catch(error => {
          toast.error("Error connecting database", error);
        });
    } else
      toast.error(String(error));

    return null;
  }
}