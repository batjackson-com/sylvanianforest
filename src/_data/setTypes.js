// Distinct set types, each with a URL slug and a count. Drives the per-type
// index pages (src/type.njk) and the "browse by type" links on the home page.
// Reads the same DB as sets.js; kept separate so the grouping lives in one place.
import { openDb } from "../../lib/db.js";

const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
