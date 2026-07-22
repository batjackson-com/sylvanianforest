// Distinct tags, each with a URL slug and a count. Drives the per-tag index
// pages (src/tag.njk) and the "browse by tag" links on the home page. Reads the
// same DB as sets.js; kept separate so the grouping lives in one place.
//
// This replaces the old setType-based browsing: tags started out seeded from
// setType, but a set can now carry any number of tags, so the browse axis is
// tags, not a single type.
import { openDb } from "../../lib/db.js";
import { slugify } from "../../lib/slugify.js";

export default function () {
  const db = openDb();
  const rows = db
    .prepare(
      `SELECT tag AS name, COUNT(*) AS count
         FROM tags
        WHERE tag IS NOT NULL AND tag <> ''
        GROUP BY tag
        ORDER BY count DESC, name`
    )
    .all();
  db.close();

  return rows.map((r) => ({ ...r, slug: slugify(r.name) }));
}
