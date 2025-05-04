import {toast} from "sonner";
import db from "../lib/db.ts";

export const BROADCAST_CHANNEL = 'patient-updates';
export const BROADCAST_UPDATE_MESSAGE = 'patient-updated';
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
    toast.error(String(error));
    return null;
  }
}