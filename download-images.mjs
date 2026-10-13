/* OrthoCare — download the website's photos into assets/images/photos/ and point the pages at them.
 *
 * Run once from the project folder (needs Node 18 or newer and an internet connection):
 *     node download-images.mjs
 *
 * What it does:
 *   1. Finds every Unsplash photo link used in the .html files and assets/js/doctors.js.
 *   2. Downloads each photo to assets/images/photos/<id>.jpg.
 *   3. Rewrites those links to the local files. Photos that fail to download keep their online link.
 * Photos are from Unsplash (free to use under the Unsplash License). You can delete this file afterwards.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.IMG_BASE || 'https://images.unsplash.com';
const outDir = path.join(root, 'assets', 'images', 'photos');
const LINK = /https:\/\/images\.unsplash\.com\/photo-([0-9a-z-]+)\?[^"'\s)]+/g;

const files = (await readdir(root)).filter((f) => f.endsWith('.html')).map((f) => path.join(root, f));
files.push(path.join(root, 'assets', 'js', 'doctors.js'));

const ids = new Set();
const sources = new Map();
for (const f of files) {
  if (!existsSync(f)) continue;
  const text = await readFile(f, 'utf8');
  sources.set(f, text);
  for (const m of text.matchAll(LINK)) ids.add(m[1]);
}
console.log(`Found ${ids.size} photos to download.`);

await mkdir(outDir, { recursive: true });
const done = new Set();
for (const id of ids) {
  const target = path.join(outDir, `${id}.jpg`);
  if (existsSync(target)) { done.add(id); console.log(`  have   ${id}`); continue; }
  try {
    const res = await fetch(`${BASE}/photo-${id}?auto=format&fit=crop&w=1200&q=75&fm=jpg`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(target, Buffer.from(await res.arrayBuffer()));
    done.add(id);
    console.log(`  saved  ${id}`);
  } catch (err) {
    console.log(`  FAILED ${id}: ${err.message} (online link kept)`);
  }
}

for (const [f, text] of sources) {
  const rel = path.relative(path.dirname(f), outDir).split(path.sep).join('/');
  const next = text.replace(LINK, (match, id) => (done.has(id) ? `${rel}/${id}.jpg` : match));
  if (next !== text) await writeFile(f, next, 'utf8');
}
console.log(`Done. ${done.size} of ${ids.size} photos are now local.`);
