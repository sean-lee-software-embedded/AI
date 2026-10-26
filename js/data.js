// Loads every data/*.json file once and builds lookup indexes.

/** Site root, resolved from this module so pages in sub-folders (e.g. /en/) share the same files. */
export const ROOT = new URL('../', import.meta.url);
/** Resolve a site-relative path such as "assets/map.webp" against the site root. */
export const asset = (path) => (path ? new URL(path, ROOT).href : path);

const FILES = ['entities', 'factions', 'glossary', 'quiz', 'flow', 'assets'];

export const db = {};

export async function loadData() {
  const results = await Promise.all(
    FILES.map((f) => fetch(asset(`data/${f}.json`)).then((r) => {
      if (!r.ok) throw new Error(`${f}.json: HTTP ${r.status}`);
      return r.json();
    })),
  );
  FILES.forEach((f, i) => { db[f] = results[i]; });

  db.assetSet = new Set(db.assets);
  db.leader = db.factions.leader;
  db.factionList = db.factions.factions;
  db.factionById = Object.fromEntries(db.factionList.map((f) => [f.id, f]));
  db.entityById = Object.fromEntries(db.entities.map((e) => [e.id, e]));
  db.membersOf = (fid) => db.entities.filter((e) => e.factions.includes(fid));
  return db;
}

/** True when an image is listed in data/assets.json (built by scripts/build-asset-manifest.py). */
export const present = (path) => Boolean(path) && db.assetSet.has(path);

/** A card counts as "written" once its plain-language summary exists. */
export const hasContent = (e) => Boolean(e.plain?.zh || e.plain?.en);
