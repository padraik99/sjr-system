# CLAUDE.md — Sprint · Jump · Resilience (SJR)
**Project type:** Multi-athlete sports rehab + performance system
**Stack:** Static HTML/CSS/JS · Supabase cloud backend · GitHub Pages hosting
**Repo:** `padraik99/sjr-system` (public) · `https://padraik99.github.io/sjr-system/`
**Last updated:** April 10, 2026

---

## What This Project Is

SJR is a family + athlete performance and rehabilitation system built and managed by Patrick (coach, architect, and athlete himself). It consists of interconnected HTML files — individual athlete weekly guides, a shared exercise library, a periodization reference, and a coach dashboard — all backed by Supabase for live pain/gate logging and session state. Files are authored in Claude conversations and deployed via GitHub Desktop to GitHub Pages.

Each athlete has:
- A **weekly guide** — the primary working document. Contains the 7-day overlay (FAB button), day-by-day session blocks with doses, Supabase pain logging, and a Browse Exercises button deep-linking to the Library.
- A **protocol/reference guide** (some athletes) — clinical rationale, exercise library with accordion cards, test data, research citations. The reference guide for the athlete's silo.
- Entries in the **coach dashboard** — card with live pain metrics, 7-day spark, gate breach alerts.

---

## Athlete Roster

| Athlete | Sport / Event | Injury / Focus | Return Target | Status |
|---------|--------------|----------------|---------------|--------|
| **Patrick** | Volleyball (King of the Court) | L4-L5 foraminal stenosis, L5 nerve root | Summer 2026 | Active — v5.3 guide · 4 metrics (Back/Nerve/Glute/Ankle) · 3 timings |
| **Shaylan** | Sprint / LJ (MJC → Berkeley) | PFPS left knee + penultimate mechanics | Conference + State | Active — competing, mechanical fix underway |
| **Cadence** | Sprint / LJ (Cal Poly) | Plantar fascia + medial shin | Commonwealth Games Glasgow, Jul 2026 | Active — modified return, Conference horizon |
| **Yari** | Pro soccer (Mexico / Nicaragua NT) | Right ACL sprain, conservative mgmt | May 2026 (preseason) · Jun 2026 (gate) | Active — Phase 2 Week 4 (Apr 7–13) · forward jog 1 mile confirmed · Nordics + lateral sled entered · 0s/1s pain logs |

### Yari Clinical Summary (quick reference)
- Right ACL sprain Nov 20 2025 · both ends intact on MRI · conservative management
- Biodex: quad 1.3% deficit (negligible) · ham right +5.4% stronger · ROM deficit 9.1° (primary flag) · NMC accel lag 20% right quad extension
- Hop test: 101% composite LSI · clinician "no hesitation, control 10/10"
- Week 4 of trainer program · gaining weight (was 5–8 lb below playing weight)
- Supabase athlete_id: `yari` · pain metric key: `knee` · gate: 3

---

## File Inventory

### Active / Current

| File | Ver | Role | Notes |
|------|-----|------|-------|
| `SJR_Dashboard_v2_20260408.html` | v2 | Coach dashboard | All 4 athletes (Patrick/Shaylan/Cadence/Yari) · pain cards · injury log · CSV export · auto-refresh 60s · nav links to v3/v4 files |
| `SJR_WeeklyGuide_Patrick_v5_20260402.html` | v5.3 | Patrick weekly | Supabase · 4 metrics: Back/Nerve/Glute/Ankle · 3 timings: AM/Pre/Post · auto-stage on metric switch |
| `shaylan_weekly_v3_20260402.html` | v3 | Shaylan weekly | Supabase · Browse exercises (same-tab) · Th/Sa/Su labels fixed |
| `Cadence_Weekly_v3_20260402.html` | v3 | Cadence weekly | Supabase · Browse exercises (same-tab) · Th/Sa/Su labels fixed |
| `SJR_Yari_Guide_v1_20260317.html` | v1 | Yari full guide + weekly | Dark theme · ROM block · 7-day overlay · Supabase pain log · Browse exercises · ACL-RSI · research |
| `SJR_Library_Master_v4_20260402.html` | v4.1 | Exercise library | 80 cards · quality + phase tags · spinal filter row removed from UI · 5 new experts · deep-link URL params |
| `SJR_Periodization_Master_v2_20260313.html` | v2 | Periodization reference | Deep-links to Library via URL params |
| `patrick_protocol_v2_20260402.html` | v2 | Patrick clinical reference | Floating This Week button |

### Superseded (keep for reference, don't link)
`SJR_Dashboard_v1_20260402.html` · `SJR_Library_Master_v2_20260313.html` · `SJR_Library_Master_v3_20260402.html` · `Yari_weekly_v1.html`

---

## Supabase

**URL:** `https://jedsnurnnwmpcbdvtlbs.supabase.co`
**Key:** `sb_publishable_3WGolnM5dOK88Y4WdKCFGA_Hi6wj-_z`
**Region:** Oregon

### Tables
| Table | Purpose | Key columns |
|-------|---------|-------------|
| `pain_logs` | Daily pain scores per athlete per metric | `athlete_id`, `date`, `metric`, `score` |
| `injury_logs` | Injury events, onset notes | `athlete_id`, `date`, `location`, `description` |
| `athlete_state` | Week/phase persistence | `athlete_id`, `current_week`, `last_updated` |

### Athlete IDs + Metric Keys
| Athlete | ID | Metrics (key → label → gate) |
|---------|----|------------------------------|
| Patrick | `patrick` | `morning` Morning Pain /2 · `nerve` Nerve/Calf /2 · `ankle` Ankle Spot /3 |
| Shaylan | `shaylan` | `knee` Knee /3 · `back` Back /2 |
| Cadence | `cadence` | `foot_shin` Foot/Shin /3 |
| Yari    | `yari`    | `knee` Right Knee /3 |

### Critical API Rules
```javascript
// Key goes in apikey header ONLY — NEVER Authorization: Bearer
const headers = { 'apikey': SB_KEY, 'Content-Type': 'application/json' };

// 204 = success with no body — handle explicitly
if(res.status === 204) return [];

// upsert pattern
headers['Prefer'] = 'resolution=merge-duplicates';
```

---

## Technical Standards

### Dates — strictly enforced
```javascript
// CORRECT — local constructor only
const base = new Date(2026, 2, 23); // month is 0-indexed
const d = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + offset);

function sbDateStr(d){
  return d.getFullYear() + '-' +
    String(d.getMonth()+1).padStart(2,'0') + '-' +
    String(d.getDate()).padStart(2,'0');
}

// NEVER — causes UTC/Pacific timezone shift
new Date('2026-03-23')        // string constructor
d.toISOString().slice(0,10)   // UTC offset bug
```

### Week Base Dates
| Athlete | Base | Value |
|---------|------|-------|
| Patrick | `new Date(2026, 2, 23)` | Mon Mar 23 2026 |
| Shaylan | `new Date(2026, 2, 9)`  | Mon Mar 9 2026  |
| Cadence | `new Date(2026, 2, 16)` | Mon Mar 16 2026 |
| Yari    | `new Date(2026, 2, 17)` | Mon Mar 17 2026 (program start) |

### detectCurrentWeek() — declare AFTER getWeekStart() and WEEKS array
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

### Script tag rule — critical
- **Exactly ONE `<script>` and ONE `</script>` per file**
- Duplicate script blocks cause `Unexpected token '<'` — the most common build error
- Run `node --check filename.js` on every script block before finalizing

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

### localStorage
- Offline fallback cache only — Supabase is primary
- Prefixes: `pt_` Patrick · `sh_` Shaylan · `cad_` Cadence · `yari_` Yari

### Day labels in FAB bar
`['M','T','W','Th','F','Sa','Su']` — NOT `['M','T','W','T','F','S','S']`
CSS: `font-size:.62rem; letter-spacing:-.02em` to fit longer labels

### Line endings
All files must be **LF only** (no CRLF). GitHub Desktop will warn on CRLF.
Fix: `sed -i 's/\r//' filename.html` or Python `content.replace(b'\r\n', b'\n')`
Permanent fix for repo: add `.gitattributes` → `* text=auto eol=lf`

---

## Library Deep-Link URL Params

Used by Browse Exercises buttons in athlete guides to pre-filter the Library.

| Param | Values | Example |
|-------|--------|---------|
| `phase` | `phase-rehab`, `phase-bridge`, `phase-gpp`, `phase-spp`, `phase-comp`, `phase-trans`, `phase-maint`, `phase-perf` | `?phase=phase-rehab,phase-bridge,phase-gpp` |
| `quality` | `quality-gpp`, `quality-hypertrophy`, `quality-strength`, `quality-power`, `quality-velocity`, `quality-isometric` | `?quality=quality-strength,quality-isometric` |
| `hidespinal` | `1` | `?hidespinal=1` (all athletes except Patrick) |
| `intensity` | `intensity-sub` | optional |

**Yari current link:** `?phase=phase-rehab,phase-bridge,phase-gpp&hidespinal=1`

> Note: `hidespinal` param is now a no-op in Library v4.1 (spinal filter row removed from UI). Param is harmless but can be cleaned from links in a future pass.

---

## Training Quality → MED (Zourdos et al., FAU)

| Quality | MED Sets | Note |
|---------|----------|------|
| Strength | 3–5 | Pronounced diminishing returns beyond this |
| Hypertrophy | 4 fractional sets | More volume rarely adds proportional gain |
| Speed/Power | Low volume, maximal intent | Full recovery between reps — CNS dominant |
| Isometric | 5×45s | Analgesic window is the target, not fatigue |
| GPP | Volume over intensity | Tissue tolerance is the goal |

---

## Expert Reference Pool

**In active use across SJR documents:**
Baar (collagen/tendon/estrogen/LOX) · Grey (joint-first loading) · Ward (Flow Motion, foot chain) · Natera (sprint-specific isometrics) · Barr (ground impulse, foot mechanics) · Schexnayder (LJ periodization, penultimate) · McGill (spine, trap bar) · Alfredson (eccentric heel raise) · Rio (isometric analgesia) · Uthoff (backward running, zero shear) · Bosch (coordination-first return to sport) · Dietz (triphasic sequencing) · Winkelman (cuing) · Zourdos (MED, training quality) · Petersen (Nordic curl meta-analysis) · Grindem (ACL LSI thresholds) · Ardern (ACL-RSI) · Filbay (conservative ACL outcomes) · Hewett (estrogen/ACL risk) · Loenneke (BFR) · Mountjoy (LEA female athletes) · Spina (CARs, joint health) · Boyle (functional movement) · Cressey (shoulder/hip mobility) · Shepherd (sprint mechanics) · Mack (speed development)

---

## Naming Convention

`SJR_[DocumentType]_[Athlete/Scope]_v[Version]_[YYYYMMDD].html`

Examples:
- `SJR_Dashboard_v2_20260408.html`
- `SJR_Yari_Guide_v1_20260317.html`
- `SJR_Library_Master_v4_20260402.html`

## Commit Message Convention

`[scope]: what changed + why`

Examples:
- `Dashboard v2: add Yari card + fix nav link versions`
- `Yari guide: Phase 2 Week 4 overlay + Supabase pain logging`
- `Girls v3 patch: Library browse same-tab, Th/Sa/Su day labels`

---

## Queued Work

### SJR — Active (priority order)
- [ ] Yari: weekly overlay update each phase/week transition (ongoing)
- [ ] Yari: date label bug fix — `toISOString().slice(0,10)` in renderDay dateLabel showing one day ahead; fix with local constructor + `sbDateStr()` pattern
- [ ] Yari: confirm `athlete_state` row exists in Supabase for `yari`
- [ ] Dashboard: clean up `hidespinal` param from Library links (now a no-op)
- [ ] Periodization Guide: Library nav buttons
- [ ] Library: high-value exercise additions (incremental)
- [ ] Shaylan individual HTML protocol document
- [ ] Cadence individual HTML protocol document
- [ ] Patrick individual HTML protocol document
- [ ] `.gitattributes` → `* text=auto eol=lf` added to repo root

### SJR — Completed
- [x] Patrick weekly guide v5 → v5.3 — 4 metrics (Back/Nerve/Glute/Ankle), 3 timings (AM/Pre/Post), auto-stage on metric switch, removed Add Another Metric button
- [x] Shaylan weekly guide v3 — Supabase, Browse exercises (same-tab), Th/Sa/Su labels
- [x] Cadence weekly guide v3 — Supabase, Browse exercises (same-tab), Th/Sa/Su labels
- [x] Library v4 → v4.1 — 80 cards (was 67), spinal filter row removed from UI, 5 new experts, phase/intensity tags fixed
- [x] Dashboard v1 → v2 — added Yari, fixed nav link versions (v3→v4 Library, v2→v3 girls)
- [x] Yari full guide v1 — clinical protocol, exercise library, weekly overlay, Supabase pain logging, Browse exercises, ACL-RSI, Phase 2 Week 4 current
- [x] CLAUDE.md — structured template committed to repo

---

## Multi-Project Note

This CLAUDE.md is **project-scoped** to SJR. When working across multiple projects:
- Each project root should have its own CLAUDE.md
- Name them descriptively if storing centrally: `CLAUDE_SJR.md`, `CLAUDE_[ProjectName].md`
- The format above (Project ID · Stack · Roster · File Inventory · DB · Rules · Queue) works as a reusable template
- Paste the relevant project's CLAUDE.md into context at the start of each session
