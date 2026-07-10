// The data seam. Eleventy calls this at build time; whatever it returns is
// available to templates as the global `sets`. Right now it reads SQLite, but
// this is the ONLY file that needs to change if the source becomes an API, CSV,
// or headless CMS — templates and permalinks stay the same.
import { openDb } from "../../lib/db.js";

export default function () {
  const db = openDb();
  const rows = db
    .prepare("SELECT * FROM sets ORDER BY family, name")
    .all();
  db.close();
  return rows;
}
