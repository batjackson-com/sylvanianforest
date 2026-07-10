// The data seam. Eleventy calls this at build time; whatever it returns is
// available to templates as the global `sets`. Right now it reads SQLite, but
// this is the ONLY file that needs to change if the source becomes an API, CSV,
// or headless CMS — templates and permalinks stay the same.
import { openDb } from "../../lib/db.js";

export default function () {
  const db = openDb();
  const sets = db.prepare("SELECT * FROM sets ORDER BY family, name").all();

  // Attach each set's photos as `set.photos` (ordered). photos.setId is a
  // foreign key to sets.id (the integer PK) — distinct from the sets.setId
  // catalog code, which is a display field. Grouping in JS keeps the two
  // `setId` meanings from colliding in a single SQL result row.
  const photos = db
    .prepare("SELECT * FROM photos ORDER BY sort, id")
    .all();
  const bySet = new Map();
  for (const p of photos) {
    if (!bySet.has(p.setId)) bySet.set(p.setId, []);
    bySet.get(p.setId).push(p);
  }
  for (const s of sets) s.photos = bySet.get(s.id) ?? [];

  db.close();
  return sets;
}
