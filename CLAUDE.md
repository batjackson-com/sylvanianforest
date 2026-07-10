# sylvanianforest.com

Static website generated from a SQLite database with Eleventy. One HTML page is
produced per database row. Visitors are served flat files from Cloudflare Pages;
the database is only ever read at **build time**, never at runtime.

## Stack

- **Eleventy (11ty) v3** — static site generator, ESM config (`eleventy.config.js`)
- **better-sqlite3** — reads the database at build time (native module; needs Node)
- **Nunjucks** — templates (`.njk`)
- **Node 24** — pinned in `.node-version`
- **Cloudflare Pages** — hosting, auto-deploys on push to `main`

## Data flow

`data/forest.db` → `src/_data/sets.js` (queries SQLite) → `src/set.njk`
(one page per row via Eleventy pagination) → `_site/` → deployed.

`src/_data/sets.js` is the **only** file that knows where data comes from.
If the data source ever changes (API, CSV, CMS), change that one file — templates
and permalinks stay the same.

## Rules

- **Never commit directly to `main`.** `main` is protected — direct pushes are
  blocked and a pull request is required. Always create a short-lived branch,
  commit there, push it, and open a PR to merge into `main`:
  ```bash
  git checkout -b <topic>
  git add -A && git commit -m "<message>"
  git push -u origin <topic>
  gh pr create --fill
  gh pr merge --squash   # self-merge is allowed (0 approvals required)
  ```
- **`data/forest.db` is the committed source of truth.** It is intentionally NOT
  gitignored. Edit it with a GUI (DB Browser for SQLite), then commit the `.db`
  file so the change is tracked and the build is reproducible.
- **NEVER run `npm run seed:reset` as part of normal work.** It DROPS the
  `sets` table and recreates it with sample data — it will destroy real
  edits. It exists only to recreate the database from scratch.
- **Never edit `_site/` by hand** — it is generated output. Change templates,
  data, or the database instead.
- Keep the site static: no runtime database calls, no server-side code. All data
  access happens at build time.

## Commands

- `npm run build` — generate the static site into `_site/`
- `npm run serve` — Eleventy dev server with live reload
- `npm run seed:reset` — DESTRUCTIVE: recreate `data/forest.db` from scratch

## Deploy

Merging a PR into `main` triggers Cloudflare Pages to build (`npm run build`,
output `_site`) and deploy automatically. Typical loop:

```bash
# edit data/forest.db in the GUI, then:
git checkout -b update-characters
git add data/forest.db && git commit -m "Update characters"
git push -u origin update-characters
gh pr create --fill && gh pr merge --squash
```
