// Distinct set types, each with a URL slug and a count. Drives the per-type
// index pages (src/type.njk) and the "browse by type" links on the home page.
// Reads the same DB as sets.js; kept separate so the grouping lives in one place.
import { openDb } from "../../lib/db.js";
import { slugify } from "../../lib/slugify.js";

// Explicit display order for the type pills / nav. Types not listed here fall
// to the end, alphabetically. Edit this list to reorder the categories.
const TYPE_ORDER = [
  "Families & Characters",
  "Buildings & Environments",
  "Furniture & Accessories",
  "Collectibles & Miscellaneous",
  "Vehicles & Transportation",
];

export default function () {
  const db = openDb();
  const rows = db
    .prepare(
      `SELECT setType AS name, COUNT(*) AS count
         FROM sets
        WHERE setType IS NOT NULL AND setType <> ''
        GROUP BY setType`
    )
    .all();
  db.close();

  const rank = (name) => {
    const i = TYPE_ORDER.indexOf(name);
    return i === -1 ? TYPE_ORDER.length : i;
  };
  rows.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));

  return rows.map((r) => ({ ...r, slug: slugify(r.name) }));
}
