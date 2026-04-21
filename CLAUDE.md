# SJR System — Claude Context

## Project
**Sprint · Jump · Resilience (SJR)** — family athletic performance and rehabilitation system.
Built as interconnected HTML files with a Supabase cloud backend.
Hosted at: `https://padraik99.github.io/sjr-system/`
GitHub repo: `padraik99/sjr-system` (public, GitHub Pages)
Workflow: GitHub Desktop — drag new file into local folder (overwrites existing), commit, push. Never delete-then-add (creates duplicate with `(1)` suffix). Never upload via GitHub website on mobile.

## Coach / Coordinator
**Patrick** — architect, coach, and athlete. Managing L4-L5 spinal rehab (foraminal stenosis).
Return-to-volleyball target: King of the Court, summer 2026.
Pain clinic pending: ESI vs radiofrequency ablation — decision gate for Phase 3+.
Weekly schedule: Mon/Wed/Fri gym · Tue canal + bands + occlusion with Yari · Thu canal + sled · Sat/Sun rest/recovery.

## Athletes
| Athlete | Sport | Injury | Status | Target |
|---------|-------|--------|--------|--------|
| Patrick | Volleyball | L4-L5 spinal rehab (foraminal stenosis) | Bridge-to-load phase | King of the Court, Summer 2026 |
| Shaylan | Sprint/Jump (MJC → Berkeley) | Knee rehab + shin splints | Active | Conference, State |
| Cadence | Sprint/Jump (Cal Poly) | Plantar fascia + shin load intolerance | Active | Commonwealth Games Glasgow, July 2026 |
| Yari | Soccer (professional) | ACL rehab | Active — own project silo | Return to play |
| Rosanne | General fitness | None | On hold — build deferred | — |

## Supabase
- **URL:** `https://jedsnurnnwmpcbdvtlbs.supabase.co`
- **Key:** `sb_publishable_3WGolnM5dOK88Y4WdKCFGA_Hi6wj-_z`
- **Region:** Oregon
- **Tables:** `pain_logs`, `injury_logs`, `athlete_state`
- **Athlete IDs:** `patrick`, `shaylan`, `cadence`, `yari`

### Supabase API rules (critical)
- `sb_publishable_` keys go in `apikey` header ONLY
- NEVER use `Authorization: Bearer` with sb_publishable_ keys — rejected silently
- 204 responses return no body — handle with `if(res.status === 204) return []`
- `sbFetch` is a regular (non-async) function — it uses `await` internally but works because it is always called from async callers
- All Supabase save functions (`saveGateLog`, `saveLogToSupabase`, etc.) MUST be marked `async`
- Missing `async` on save functions = silent failure — logs reach localStorage but never Supabase

### Critical async pattern
```javascript
// CORRECT
function sbFetch(path, opts = {}){
  // uses await internally — called only from async functions
}
async function saveGateLog(athleteId, entry){
  const result = await sbFetch('/rest/v1/pain_logs', { ... });
}

// WRONG — causes syntax error
async function sbFetch(...){ }         // don't mark sbFetch async
async async function saveGateLog(){ }  // never stack async keywords
```

## File Inventory (canonical — April 2026)
| File | Version | Notes |
|------|---------|-------|
| `SJR_WeeklyGuide_Patrick_v5_20260402.html` | v5.4 | Supabase · 4-metric pain log (Back/Nerve/Glute/Ankle) · 3 timings (AM/Pre/Post) · auto-stage on metric switch · foot yoga · injury modal (⚠ Issue) · Bridge W5 Steady (Apr 20–26) · Return to Athletic Life header · bent knee glute bridge cue |
| `shaylan_weekly_v3_20260402.html` | v3 | Supabase · framework skeleton · Browse exercises (absolute URL, same tab) · Th/Sa/Su labels |
| `Cadence_Weekly_v3_20260402.html` | v3 | Supabase · framework skeleton · Browse exercises · async saveGateLog fixed |
| `SJR_Yari_Guide_v2_20260414.html` | v2.1 | Supabase-wired · ACL rehab · Week 6 deload (Apr 20–26) · volume −30% load held · canal sessions labelled with Patrick · injury modal (⚠ Issue) added 2026-04-21 · ATHLETE_ID constant added · regions: Knee/Hip/Hamstring/Ankle/Back/Shoulder/Other |
| `SJR_Library_Master_v4_20260402.html` | v4.1 | 80 cards · quality tags · 6-quality filter · spinal filter UI removed · absolute Browse URLs |
| `SJR_Dashboard_v2_20260408.html` | v2.2 | All 4 athletes · auto-refresh · injury log · CSV export · **security patch 2026-04-16**: stored XSS fixed (renderInjuryTable → DOM/textContent), input validation added (maxlength + JS guards), e.message innerHTML→textContent, setInterval moved to init · **schema fix 2026-04-21**: injury_logs column `location`→`region` to match athlete guide writes; Yari link updated to v2 |
| `patrick_protocol_v2_20260402.html` | v2 | Floating This Week button |
| `SJR_Periodization_Master_v2_20260313.html` | v2 | Library links fixed to absolute URL v4.1 |

### Version numbering convention
- Bump **date suffix** for fixes/patches: `_v3_20260402` → `_v3_20260414`
- Bump **version number** for structural changes: v3 → v4
- Overwrite via GitHub Desktop — never delete-then-upload on mobile

## Technical Standards

### Dates — strictly enforced
```javascript
// CORRECT — local constructor
const base = new Date(2026, 2, 23); // month is 0-indexed
const d = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + offset);

// CORRECT — date string from local date
function sbDateStr(d){
  return d.getFullYear() + '-' +
    String(d.getMonth()+1).padStart(2,'0') + '-' +
    String(d.getDate()).padStart(2,'0');
}

// NEVER — causes UTC/Pacific timezone shift (shows day before in US)
new Date('2026-03-23')        // string constructor parses as UTC midnight
d.toISOString().slice(0,10)   // returns UTC date, not local date
```

### Week base dates
- Patrick: `new Date(2026, 2, 23)` — Mon Mar 23 2026
- Shaylan: `new Date(2026, 2, 9)` — Mon Mar 9 2026
- Cadence: `new Date(2026, 2, 16)` — Mon Mar 16 2026
- Yari: confirm from file

### detectCurrentWeek() — always declare AFTER getWeekStart() and AFTER WEEKS array
```javascript
function detectCurrentWeek(){
  const today = sbDateStr(new Date());
  for(let w = 0; w < WEEKS.length; w++){
    const ws = getWeekStart(w);
    for(let d = 0; d < 7; d++){
      const sd = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + d);
      if(sbDateStr(sd) === today) return { week: w, day: d };
    }
  }
  return null;
}
```

### Script tag rule
- Exactly ONE `<script>` open and ONE `</script>` close per file
- Run `node --check` on extracted script block before every output
- Duplicate script blocks cause `Unexpected token '<'` — most common build error

### localStorage
- Offline fallback cache only — never primary store
- Prefixes: `pt_` (Patrick) · `sh_` (Shaylan) · `cad_` (Cadence) · `yari_` (Yari)

### Day labels — FAB bar
```javascript
// CORRECT
['M','T','W','Th','F','Sa','Su']
// CSS: font-size:.62rem; letter-spacing:-.02em

// WRONG — Tuesday and Thursday indistinguishable
['M','T','W','T','F','S','S']
```

### Browse exercises button
```javascript
const LIBRARY_URL = 'https://padraik99.github.io/sjr-system/SJR_Library_Master_v4_20260402.html';
// Always absolute URL — relative paths 404 on mobile/bookmarked links
// No target="_blank" — Safari iOS blocks new tabs from links
// Same-tab navigation — Supabase persists week state on return
```

### Async init pattern (all weekly guides)
```javascript
async function initApp(){
  const det = detectCurrentWeek();
  if(det !== null){
    currentWeek = det.week;
    localStorage.setItem('xx_week', currentWeek);
  } else {
    currentWeek = await loadWeekState('athlete_id', currentWeek);
  }
  await loadGateLogs('athlete_id', gateLogs);
  updateWeekUI();
  initDaySelector();
  if(det !== null) selectDay(det.day);
}
initApp();
```

## Library (v4.1)
**80 cards** across 11 sections:
Posterior Chain · Anterior Chain · Single-Leg Complex · Isometric Holds · Hip & Glute · Upper Body · Mobility & Joint Prep · Sprint Drills · Jump & Bound · Ankle & Foot · Energy System

**Filter groups (AND across groups, OR within group):**
- Phase: `phase-rehab` · `phase-bridge` · `phase-gpp` · `phase-spp` · `phase-comp` · `phase-trans` · `phase-maint` · `phase-perf`
- Quality: `quality-gpp` · `quality-hypertrophy` · `quality-strength` · `quality-power` · `quality-velocity` · `quality-isometric`
- Intensity: `intensity-sub` · `intensity-max`

**Spinal load:** `sl-low` · `sl-mod` · `sl-high` tags remain on cards (Patrick's guide reads them) but Spinal Load filter row is removed from Library UI. `hidespinal` URL param is deprecated.

**URL deep-link format:**
```
https://padraik99.github.io/sjr-system/SJR_Library_Master_v4_20260402.html?phase=phase-bridge,phase-gpp&quality=quality-strength&intensity=intensity-sub
```

## Training Quality → MED (Zourdos et al., FAU JSHS 2024)
| Quality | MED | Note |
|---------|-----|------|
| Strength | 3–5 sets | Diminishing returns beyond this |
| Hypertrophy | 4 fractional sets | More volume rarely adds proportional gain |
| Speed/Power | Low volume, maximal intent | Full recovery — CNS dominant |
| Isometric | 5×45s (Rio analgesia) or 20–30s (Baar collagen) | Different durations, different mechanisms |
| GPP | Volume over intensity | Tissue tolerance is the goal |

## Expert Reference Pool (19)
Baar · Grey · Ward · Natera · Barr · Schexnayder · McGill · Alfredson · Rio · Uthoff · Bosch · Dietz · Winkelman · Zourdos · Spina · Boyle · Cressey · Shepherd · Mack

| Expert | Scope |
|--------|-------|
| Baar | Collagen/tendon programming, isometric loading, estrogen-LOX interaction |
| Grey | Joint-first biomechanics, load tolerance development |
| Ward | Flow Motion triplanar model, frontal plane loading |
| Natera | Sprint-specific isometrics, overcoming isos, gait phase loading |
| Barr | Ground impulse, foot-ankle spring, joint-level sprint analysis |
| Schexnayder | LJ periodization, penultimate mechanics, CNS load management |
| McGill | Spinal load classification, Big Three, neutral spine lifting |
| Alfredson | Eccentric heel raise protocol (1998), Achilles tendinopathy |
| Rio | Isometric analgesia (2015), patellar tendinopathy, cortical inhibition |
| Uthoff | Backward running, non-impact load management |
| Bosch | Sprint biomechanics as coordination, bi-articular hamstring, single-leg Roman Chair |
| Dietz | Triphasic model (eccentric→isometric→concentric), ACL prevention |
| Winkelman | Motor learning, internal vs external cueing, sprint mechanics coaching |
| Zourdos | MED and diminishing returns framework (FAU JSHS 2024) |
| Spina | FRC/CARs/PAILs/RAILs, end-range isometric loading, joint health |
| Boyle | Psoas activation, Pallof press, joint-by-joint movement model |
| Cressey | Hip mobility, 90/90 transition, shoulder health, baseball athletes |
| Shepherd | LJ run-up mechanics, resisted sprint methodology, drop jump progressions |
| Mack | Movement elasticity, scapular motor control, NHL/NBA applied practice |

## Commit Message Convention
`[scope]: what changed + why`

Examples:
- `Patrick v5.3: auto-stage on metric switch, remove Add Another Metric button`
- `Library v4.1: +13 exercises, retag intensity/quality, remove spinal filter UI`
- `Cadence v3: fix async saveGateLog — Supabase logs now saving`
- `Periodization v2: fix Library links to absolute URL v4.1`
- `CLAUDE.md: update to April 2026 state`

## Security Audit — Status (updated 2026-04-16)

Full audit report: `SJR_Security_Audit_20260416.md` (in repo root)

### Completed fixes (2026-04-16) — Dashboard v2.1 (planned)
- [x] CRITICAL: renderInjuryTable() — DOM/textContent replaces innerHTML for user fields *(applied 2026-04-21)*
- [ ] CRITICAL: saveInjury() — maxlength attrs + JS length guards before POST *(not yet applied)*
- [x] HIGH: loadAll() catch — e.message via innerHTML → DOM construction *(applied 2026-04-21)*
- [x] HIGH: setInterval inside saveInjury() → moved to top-level init *(applied 2026-04-21)*

### Completed fixes (2026-04-21) — Dashboard v2.2
- [x] SCHEMA: injury_logs writes `location` → corrected to `region` (matches athlete guide schema)
- [x] SCHEMA: exportInjuryCSV headers updated location→region
- [x] LINK: Yari weeklyFile updated to v2 (`SJR_Yari_Guide_v2_20260414.html`)

### Completed fixes (2026-04-16) — CSP (all 8 files)
- [x] HIGH: All 8 files — CSP meta tag added: default-src none; script-src unsafe-inline; connect-src Supabase (Supabase files) or none (static files); style-src unsafe-inline + fonts.googleapis.com; font-src fonts.gstatic.com; img-src self data:
- Note: frame-ancestors NOT settable via meta tag — requires HTTP header. GitHub Pages does not support custom headers natively. Acknowledged gap — mitigated by XSS fix eliminating the primary injection path.

### Remaining remediation queue
- [x] HIGH: Supabase RLS policies on pain_logs, injury_logs, athlete_state — verified 2026-04-14
- [ ] MEDIUM: Yari guide lines 847/1513 — innerHTML for score/today → textContent
- [ ] MEDIUM: Weekly guides (Patrick/Shaylan/Cadence/Yari) — innerHTML for WEEKS/phase-badge → DOM construction
- [ ] MEDIUM: Library -1 suffix artifact — confirm canonical file exists, remove duplicate
- [ ] MEDIUM: Document localStorage plaintext health data risk in codebase
- [ ] LOW: CSV export confirmation prompt before download
- [ ] LOW: Consider self-hosting Google Fonts

### Active session rules
- Any fix must be matched by a changelog entry in CLAUDE.md and a checklist update above.
- User/stored data must render via textContent, never innerHTML.
- Default to zero-dependency, free solutions.
- Flag any deviation from these rules before proceeding.