#!/usr/bin/env node

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', 'src');

const norm = (p) => p.split(sep).join('/');

const LAYER_ORDER = { app: 3, pages: 2, entities: 1, shared: 0 };
const SLICED_LAYERS = new Set(['entities', 'pages']);

function getLayer(rel) {
  const top = rel.split('/')[0];
  return LAYER_ORDER[top] !== undefined ? top : null;
}

function getSlice(rel) {
  const layer = getLayer(rel);
  if (!layer) return null;
  if (SLICED_LAYERS.has(layer)) return rel.split('/').slice(0, 2).join('/');
  return layer;
}

const IMPORT_RE = /(?:import\s+.*?from\s+|require\s*\(\s*)['"](@\/[^'"]+)['"]/g;

function extractImports(content) {
  const out = [];
  let m;
  while ((m = IMPORT_RE.exec(content)) !== null) out.push(m[1]);
  return out;
}

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (/\.[jt]sx?$/.test(e.name)) out.push(full);
  }
  return out;
}

const violations = [];

for (const full of walk(srcDir)) {
  const rel = norm(relative(srcDir, full));
  const layer = getLayer(rel);
  if (!layer) continue; // entry point (main.tsx) — not in any layer

  const slice = getSlice(rel);
  const content = readFileSync(full, 'utf-8');

  for (const imp of extractImports(content)) {
    const impPath = imp.replace('@/', '');
    const impLayer = getLayer(impPath);
    if (!impLayer) continue; // external package

    const impSlice = getSlice(impPath);

    // 1. Layer direction: cannot import from upper layer
    if (LAYER_ORDER[impLayer] > LAYER_ORDER[layer]) {
      violations.push(`${rel} → ${imp}  (layer: ${impLayer} > ${layer})`);
    }

    // 2. Cross-slice: same sliced layer, different slice
    if (
      LAYER_ORDER[impLayer] === LAYER_ORDER[layer] &&
      SLICED_LAYERS.has(impLayer) &&
      impSlice !== slice
    ) {
      violations.push(`${rel} → ${imp}  (cross-slice: ${slice} → ${impSlice})`);
    }

    // 3. Public API: cross-slice import must use barrel, not internals
    if (SLICED_LAYERS.has(impLayer) && impSlice !== slice && impPath.split('/').length > 2) {
      const barrel = impPath.split('/').slice(0, 2).join('/');
      violations.push(`${rel} → ${imp}  (bypasses public API, use @/${barrel})`);
    }
  }
}

if (violations.length) {
  console.error(`\nFSD violations (${violations.length}):\n`);
  for (const v of violations) console.error(`  ❌ ${v}`);
  console.error('');
  process.exit(1);
} else {
  console.log('✅ No FSD violations');
}
