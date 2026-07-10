// Distinct set types, each with a URL slug and a count. Drives the per-type
// index pages (src/type.njk) and the "browse by type" links on the home page.
// Reads the same DB as sets.js; kept separate so the grouping lives in one place.
import { openDb } from "../../lib/db.js";
import { slugify } from "../../lib/slugify.js";

export default function () {
  const db = openDb();
  const rows = db
    .prepare(
      `SELECT setType AS name, COUNT(*) AS count
         FROM sets
        WHERE setType IS NOT NULL AND setType <> ''
        GROUP BY setType
        ORDER BY setType`
    )
    .all();
  db.close();
  return rows.map((r) => ({ ...r, slug: slugify(r.name) }));
}
