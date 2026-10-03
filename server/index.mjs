/**
 * Lumbercorpedia server.
 *
 * Two jobs:
 *   1. Serve the built single-page app (./dist).
 *   2. Act as a hardened bridge to the official Torn API so browser code never
 *      has to talk cross-origin to api.torn.com (and so a players API key is
 *      never embedded in a URL we log).
 *
 * The bridge is deliberately dumb and allow-listed: no user-supplied host, no
 * user-supplied path. Sections and selections are validated against Torn's own
 * published lists.
 */
import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';

const TORN_BASE = 'https://api.torn.com';

/** Torn API v1 sections Lumbercorpedia is allowed to relay. */
const ALLOWED_SECTIONS = new Set([
  'user',
  'faction',
  'company',
  'property',
  'market',
  'torn',
  'key',
]);

/** Torn API v1 selections (per the official API docs). */
const ALLOWED_SELECTIONS = new Set([
  // user
  'ammo', 'attacks', 'attacksfull', 'bars', 'battlestats', 'bazaar', 'cooldowns', 'crimes',
  'discord', 'display', 'education', 'equipment', 'events', 'gym', 'honors', 'icons', 'inventory',
  'job', 'jobpoints', 'lookup', 'medals', 'merits', 'messages', 'missions', 'money', 'networth',
  'notifications', 'perks', 'personalstats', 'profile', 'properties', 'refills', 'reports',
  'revives', 'revivesfull', 'skills', 'stocks', 'travel', 'weapons', 'workstats',
  // faction
  'applications', 'armor', 'armorynews', 'attacknews', 'attacks', 'attacksfull', 'basic',
  'chain', 'chainreport', 'chains', 'contributors', 'crimeexp', 'crimes', 'currency', 'donations',
  'fundsnews', 'medicalnews', 'membershipnews', 'news', 'positions', 'rankedwars', 'raids',
  'revives', 'revivesfull', 'stats', 'territory', 'territorynews', 'upgrades', 'weapons',
  // company
  'companies', 'detailed', 'employees', 'news', 'stock',
  // property
  'property', 'timestamp',
  // market
  'bazaar', 'itemmarket', 'pointsmarket',
  // torn
  'bank', 'cards', 'cityshops', 'competition', 'education', 'factiontree', 'gyms', 'honors',
  'itemdetails', 'items', 'itemstats', 'logcategories', 'logtypes', 'medals', 'organizedcrimes',
  'properties', 'stocks', 'territory',
  // key
  'info',
]);

const app = express();
app.disable('x-powered-by');
app.use(compression());
app.use(express.json({ limit: '32kb' }));

// ---------------------------------------------------------------------------
// Torn API bridge
// ---------------------------------------------------------------------------

/**
 * POST /api/torn
 * body: { section, id?, selections, key, comment? }
 * The key is used for exactly one upstream request and is never persisted.
 */
app.post('/api/torn', async (req, res) => {
  const { section, id, selections, key, comment } = req.body ?? {};

  if (typeof section !== 'string' || !ALLOWED_SECTIONS.has(section)) {
    return res.status(400).json({ error: 'Unknown Torn API section.' });
  }
  if (typeof key !== 'string' || key.trim().length < 10) {
    return res.status(400).json({ error: 'A Torn API key is required for this request.' });
  }
  const sel = String(selections || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (sel.length === 0) {
    return res.status(400).json({ error: 'At least one selection is required.' });
  }
  const bad = sel.filter((s) => !ALLOWED_SELECTIONS.has(s));
  if (bad.length) {
    return res.status(400).json({ error: `Selection not allowed: ${bad.join(', ')}` });
  }
  const safeId = id === undefined || id === null || id === '' ? '' : String(id).replace(/[^0-9]/g, '');
  if (id !== undefined && id !== '' && safeId === '') {
    return res.status(400).json({ error: 'Numeric IDs only.' });
  }

  const params = new URLSearchParams();
  params.set('selections', sel.join(','));
  params.set('key', key.trim());
  if (typeof comment === 'string' && comment) params.set('comment', comment.slice(0, 32));

  const url = `${TORN_BASE}/${section}/${safeId}?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    const upstream = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'Lumbercorpedia/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    const text = await upstream.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: 'Torn returned a non-JSON response.', status: upstream.status });
    }
    // Pass Torn's own error envelope through untouched so the UI can explain it.
    res.status(200).json({ ok: upstream.ok, status: upstream.status, data: json });
  } catch (err) {
    const aborted = err?.name === 'AbortError';
    res.status(aborted ? 504 : 502).json({
      error: aborted ? 'Torn API timed out.' : 'Could not reach the Torn API from the server.',
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'lumbercorpedia', version: '1.0.0', dist: fs.existsSync(DIST) });
});

// ---------------------------------------------------------------------------
// Static app
// ---------------------------------------------------------------------------

if (fs.existsSync(DIST)) {
  app.use(
    express.static(DIST, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    }),
  );
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
} else {
  app.get('*', (_req, res) =>
    res
      .status(200)
      .send(
        '<pre style="font:14px ui-monospace;padding:32px;color:#e6e9ee;background:#0d1014">' +
          'Lumbercorpedia server is running, but no production build was found.\n\n' +
          '  npm run build   # build the app\n' +
          '  npm start       # serve it\n\n' +
          'While developing, run the Vite dev server instead:\n\n' +
          '  npm run dev\n' +
          '  npx vite        # (in a second shell, if you want HMR UI)</pre>',
      ),
  );
}

app.listen(PORT, HOST, () => {
  console.log(`[lumbercorpedia] listening on http://${HOST}:${PORT}`);
});
