import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "@/lib/db/schema";

const databasePath =
  process.env.SQLITE_DB_PATH ?? path.join(process.cwd(), "data", "dashboard.sqlite");

mkdirSync(path.dirname(databasePath), { recursive: true });

export const sqlite = new Database(databasePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { schema };
