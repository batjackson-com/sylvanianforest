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
  DROP TABLE IF EXISTS photos;
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
    setId       TEXT,
    setType     TEXT
  );
  CREATE TABLE photos (
    id       INTEGER PRIMARY KEY,
    setId    INTEGER NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    caption  TEXT,
    sort     INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX idx_photos_setId ON photos(setId);
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
  `INSERT INTO sets (slug, name, family, species, year, description, brand, setId, setType)
   VALUES (@slug, @name, @family, @species, @year, @description, @brand, @setId, @setType)`
);

// Non-visible grouping field: drives the per-type index pages (/types/<slug>/).
// Sample data is all figures, so these are just spread across the categories to
// populate each type index — real data sets setType to the actual product type.
const SET_TYPES = [
  "Families & Characters",
  "Buildings & Environments",
  "Furniture",
  "Vehicles & Transportation",
  "Collectibles & Miscellaneous",
];

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
      setId: `SF-${String(n).padStart(4, "0")}`,
      setType: SET_TYPES[n % 5],
    });
  }
}

insertMany(rows);

// Sample photos. Files live in src/assets/sets/ and are committed to the repo.
// setId here is the foreign key to sets.id, looked up by slug.
const setIdBySlug = (slug) =>
  db.prepare("SELECT id FROM sets WHERE slug = ?").get(slug).id;

const insertPhoto = db.prepare(
  `INSERT INTO photos (setId, filename, caption, sort)
   VALUES (@setId, @filename, @caption, @sort)`
);
const samplePhotos = [
  ["chocolate-rabbit-father", "chocolate-rabbit-father-1.svg", "Box front", 0],
  ["chocolate-rabbit-father", "chocolate-rabbit-father-2.svg", "Set contents", 1],
  ["chocolate-rabbit-mother", "chocolate-rabbit-mother-1.svg", "Box front", 0],
  ["hazelnut-chipmunk-father", "hazelnut-chipmunk-father-1.svg", "Box front", 0],
];
db.transaction(() => {
  for (const [slug, filename, caption, sort] of samplePhotos) {
    insertPhoto.run({ setId: setIdBySlug(slug), filename, caption, sort });
  }
})();

console.log(`Seeded ${rows.length} sets and ${samplePhotos.length} photos into ${DB_PATH}`);
db.close();
