# Lumbercorpedia

**Torn City intelligence, upgraded.** A searchable knowledge base *and* the calculators the wiki never shipped.

The official Torn wiki is a set of pages you have to already know the name of. Lumbercorpedia indexes the whole game
into one search box (⌘K), then answers the questions you actually have with transparent maths instead of vibes.

---

## What's inside

### One search box for everything

Press <kbd>⌘</kbd><kbd>K</kbd> (or <kbd>/</kbd>) anywhere and search items, item IDs, weapons, drugs, gyms, courses,
degrees, crimes, company specials and tools from a single ranked index. Deep links carry filters into pages — search an
item and land on its row.

### Databases

| Section | What you get |
| --- | --- |
| **Items** | Item IDs (never shown in-game), categories, rarity, and where players actually get each item. Click an ID to copy it. |
| **Weapons** | Damage/accuracy roll ranges, stealth, calibre, clip, rate of fire and special ammo for primary, secondary and melee weapons — sortable, with a side-by-side comparison tray. |
| **Drugs** | Effect text, cooldown windows, addiction points and overdose consequences for every drug, plus what each one is actually for. |
| **Gyms** | All 33 gyms: unlock costs, energy per train, dot values per stat, gym-EXP thresholds, specialist requirements — with your own membership tracker. |
| **Education** | Course tables with prerequisites, costs, working stats and unlocks (Biology and Computer Science fully modelled), plus verified payoffs for the other ten degrees. |
| **Crimes 2.0** | All 12 crime types with categories, enhancers, tool requirements, merits and community nerve-to-max records. |
| **Companies** | Verified company specials only — no invented star ratings — plus the mechanics that decide director profit. |

### Calculators

Six tools that show their own formulas:

1. **Gym gains calculator** — models a session *train by train*, because every train burns happiness and happiness sets
   the next train's value. Uses the published Torn gain formula with the real constants.
2. **Stat projection** — compounds gains forward day by day and runs backwards to give you a target date.
3. **Booster planner** — builds a drug stack, sums energy/nerve/happiness, tracks sequential cooldown windows and totals
   the addiction you are taking on.
4. **Study planner** — dependency-orders your courses, applies the additive merit/WSU/principal reductions and reports a
   finish date with the working stats you bank on the way.
5. **Travel profit** — counts buy price, sell price, fees, flight, hotel and other costs, then gives you net profit,
   ROI, profit per hour and the break-even load.
6. **Company profit** — revenue → wages → operating costs → director cut → margin, plus the highest wage the company can
   afford before it stops making money.

### Bring your own data

Connect a Torn API key and the calculators can be seeded with your real battle stats and bars. The key is stored in your
browser only and relayed **one request at a time** by this app's own server, which allow-lists Torn's sections and
selections. Nothing is written to a database, and nothing is written back to Torn.

---

## Running it

```bash
npm install

# production-style: builds nothing, serves the pre-built app + the Torn API bridge
npm run build      # typecheck + bundle into dist/
npm start          # http://localhost:8787

# development: Vite dev server with HMR (proxies /api to the bridge)
npm run api        # terminal 1 — the Torn API bridge on :8787
npm run dev        # terminal 2 — Vite on :5173
```

Other scripts:

```bash
npm run typecheck  # tsc --noEmit, strict
npm run smoke      # renders every route in jsdom and checks the maths
```

### Why a server at all?

The browser never talks to `api.torn.com` directly. `server/index.mjs`:

* allow-lists Torn's API sections and selections (no user-supplied host or path),
* forwards one request per call and never stores or logs the API key,
* serves the built SPA with long-lived caching on hashed assets and an SPA fallback,
* binds `0.0.0.0` so it works behind a container or preview proxy.

---

## Project layout

```
src/
  data/        gyms, weapons, drugs, education, crimes, items, companies
  lib/         gym maths, formatting, search index, API client, persisted store, hooks
  components/  layout, command palette, data table, UI primitives
  pages/       databases, tools, profile, about
server/        Express app: static hosting + hardened Torn API bridge
tools/         jsdom render smoke test
```

## Honesty policy

A reference tool is only as good as its provenance, so the app enforces three rules:

1. **Published or labelled.** Numbers taken from Torn's wiki or API are cited. Community observations (nerve-to-max
   records, for example) are marked *estimate* in the interface itself, not in a footnote.
2. **Show the formula.** Every calculator prints the equation it uses — the gym calculator shows the gain constants it
   is running on.
3. **Blank beats wrong.** Where data genuinely is not available, the UI shows a dash and explains why. It does not fill
   the gap with a plausible-looking number.

Known gaps are listed on the **About & sources** page inside the app, including the fact that Torn's post-2022
decreasing-rate gym curve above ~50m per stat cannot be reproduced from the published constants — the calculators flag
that rather than quietly overstating your gains.

---

## Disclaimer

Lumbercorpedia is an unofficial fan project. It is not affiliated with Torn or Chedburn Networks. Item IDs, gym tables,
drug effects and course data are compiled from Torn's publicly available wiki and API; always treat the in-game value as
authoritative when they disagree.
