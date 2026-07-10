// DESTRUCTIVE: `npm run seed:reset` DROPS the sets table and recreates it from
// scratch with sample rows. Do NOT run this in your normal edit loop — it will
// wipe any edits made in the GUI. It exists only to (re)create the DB from zero.
// Normal workflow is: edit data/forest.db in a GUI, then `npm run build`.
import { openDb, DB_PATH } from "../lib/db.js";
import fs from "node:fs";
import path from "node:path";

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = openDb();

db.exec(`
  DROP TABLE IF EXISTS sets;
  CREATE TABLE sets (
    id          INTEGER PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    family      TEXT NOT NULL,
    species     TEXT NOT NULL,
    year        INTEGER,
    description TEXT,
    brand       TEXT,
    set_id      TEXT
  );
`);

const FAMILIES = [
  ["Chocolate Rabbit", "rabbit"],
  ["Hazelnut Chipmunk", "chipmunk"],
  ["Walnut Squirrel", "squirrel"],
  ["Meadow Vole", "vole"],
  ["Freya Bear", "bear"],
  ["Dappledawn Rabbit", "rabbit"],
];
const ROLES = ["Father", "Mother", "Brother", "Sister", "Baby", "Grandfather", "Grandmother"];

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const insert = db.prepare(
  `INSERT INTO sets (slug, name, family, species, year, description, brand, set_id)
   VALUES (@slug, @name, @family, @species, @year, @description, @brand, @set_id)`
);

// Generate a few hundred sample rows so pagination/build behavior is realistic.
const insertMany = db.transaction((rows) => rows.forEach((r) => insert.run(r)));

const rows = [];
let n = 0;
for (const [family, species] of FAMILIES) {
  for (const role of ROLES) {
    n++;
    const name = `${family.split(" ")[0]} ${role}`;
    rows.push({
      slug: slugify(`${family}-${role}`),
      name,
      family,
      species,
      year: 1985 + (n % 35),
      description: `${name} of the ${family} family, a beloved ${species} of Sylvanian Forest.`,
      brand: "Sylvanian Families",
      set_id: `SF-${String(n).padStart(4, "0")}`,
    });
  }
}

insertMany(rows);
console.log(`Seeded ${rows.length} sets into ${DB_PATH}`);
db.close();
