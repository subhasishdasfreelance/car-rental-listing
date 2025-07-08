export const runtime = "nodejs";

import { fileURLToPath } from "url";
import path from "path";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "car_store.db"), {
  verbose: console.log,
});
db.pragma("journal_mode = WAL");

export type ResponseType<T = undefined> = {
  success: boolean;
  msg?: string;
  data?: T
};

export default db;
