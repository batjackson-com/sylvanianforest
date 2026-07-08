import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Single source of truth for the DB location. Swap this file (or the query
// in src/_data/*.js) if the data source changes later — templates won't care.
export const DB_PATH = path.join(__dirname, "..", "data", "forest.db");

export function openDb() {
  return new Database(DB_PATH, { readonly: false });
}
