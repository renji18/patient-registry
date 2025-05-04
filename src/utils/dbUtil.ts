import {toast} from "sonner";
import db from "../lib/db.ts";

export async function runQuery<T = never>(query: string, params: unknown[] = []): Promise<T[] | null> {
  try {
    if (!db) throw new Error('Database not found');

    const result = await db.query(query, params);
    toast.success("Query successful");
    return result.rows as T[];
  } catch (error: unknown) {
    console.error("Database query failed:", error);
    toast.error(String(error));
    return null;
  }
}