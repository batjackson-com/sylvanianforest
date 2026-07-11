// Shared slug helper. Used by the type index pages (their permalinks) AND by
// the set pages (links to those indexes), so both must agree — keep it here,
// one definition, to guarantee the URLs match.
export const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
