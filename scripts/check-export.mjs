import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const basePath = process.argv[2] ?? '';
const output = path.resolve(import.meta.dirname, '../out');
const publicDir = path.resolve(import.meta.dirname, '../public');
const origin = 'https://pages.example';
const pageUrl = new URL(`${basePath}/`, origin);

async function checkReference(reference, from) {
  if (reference.startsWith('data:')) return;
  const url = new URL(reference, from);
  if (url.origin !== origin) return;
  assert(url.pathname.startsWith(`${basePath}/`), `Missing base path in ${reference}`);
  const relative = decodeURIComponent(url.pathname.slice(basePath.length + 1));
  const file = await stat(path.join(output, relative || 'index.html'));
  assert(file.isFile() && file.size > 0, `Invalid reference: ${reference}`);
}

const html = await readFile(path.join(output, 'index.html'), 'utf8');
const ids = new Set(Array.from(html.matchAll(/\sid="([^"]+)"/g), ([, id]) => id));
for (const id of ['inicio', 'cabeca', 'filosofos', 'coroa']) {
  assert(ids.has(id), `Missing chapter: ${id}`);
}
for (const [, attribute, value] of html.matchAll(/\s(src|srcset|poster|href)="([^"]+)"/gi)) {
  if (value.startsWith('#')) {
    assert(ids.has(value.slice(1)), `Broken anchor: ${value}`);
    continue;
  }
  const references = attribute.toLowerCase() === 'srcset'
    ? value.split(',').map((item) => item.trim().split(/\s+/)[0])
    : [value];
  for (const reference of references) await checkReference(reference, pageUrl);
}

const chunks = path.join(output, '_next/static/chunks');
for (const name of await readdir(chunks)) {
  if (!name.endsWith('.css')) continue;
  const css = await readFile(path.join(chunks, name), 'utf8');
  const cssUrl = new URL(`_next/static/chunks/${name}`, pageUrl);
  for (const [, reference] of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    await checkReference(reference.trim(), cssUrl);
  }
}

const assets = [
  'img/aristoteles.webp', 'img/platao.webp', 'img/socrates.webp',
  'img/hero-poster.webp', 'img/hero-poster-day.webp', 'img/temple-mask.png',
  'img/salao.webp', 'img/salao-mobile.webp', 'video/hero.mp4', 'video/hero-mobile.mp4',
];
for (const [directory, count] of [
  ['parte2', 242], ['parte2/mobile', 121], ['parte4', 482], ['parte4/mobile', 241],
]) {
  for (let index = 1; index <= count; index++) {
    assets.push(`frames/${directory}/f_${String(index).padStart(4, '0')}.webp`);
  }
}
for (const asset of assets) {
  const original = await readFile(path.join(publicDir, asset));
  const exported = await readFile(path.join(output, asset));
  assert(original.length > 0 && original.equals(exported), `Invalid exported asset: ${asset}`);
}
console.log(`Validated ${assets.length} media files and all HTML and CSS references.`);
