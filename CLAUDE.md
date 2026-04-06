# SJR System — Claude Code Context

## Project
**Sprint · Jump · Resilience (SJR)** — family athletic performance and rehabilitation system.
Built as interconnected HTML files with a Supabase cloud backend.
Hosted at: `https://padraik99.github.io/sjr-system/`
GitHub repo: `padraik99/sjr-system` (public, GitHub Pages)

## Coach / Coordinator
**Patrick** — architect, coach, and athlete. Managing L4-L5 spinal rehab (foraminal stenosis).
Return-to-volleyball target: King of the Court, summer 2026.
Pain clinic pending: ESI vs radiofrequency ablation decision gate for Phase 3+.

## Athletes
| Athlete | Sport | Injury | Target |
|---------|-------|--------|--------|
| Patrick | Volleyball | L4-L5 spinal rehab | King of the Court, Summer 2026 |
| Shaylan | Sprint/Jump (MJC → Berkeley) | Knee rehab + shin splints | Conference, State |
| Cadence | Sprint/Jump (Cal Poly) | Foot/shin rehab | Commonwealth Games Glasgow, July 2026 |
| Yari | Soccer (professional) | ACL rehab | Return to play |

## Supabase
- **URL:** `https://jedsnurnnwmpcbdvtlbs.supabase.co`
- **Key:** `sb_publishable_3WGolnM5dOK88Y4WdKCFGA_Hi6wj-_z`
- **Region:** Oregon
- **Tables:** `pain_logs`, `injury_logs`, `athlete_state`
- **Athlete IDs:** `patrick`, `shaylan`, `cadence` (Yari pending)

### Supabase API rules (critical)
- `sb_publishable_` keys go in `apikey` header ONLY
- NEVER use `Authorization: Bearer` with sb_publishable keys — it will be rejected
- 204 responses return no body — handle with `if(res.status === 204) return []`

## File Inventory
| File | Version | Notes |
|------|---------|-------|
| `SJR_WeeklyGuide_Patrick_v5_20260402.html` | v5 | Supabase, 5-metric gate log, foot yoga, autoregulation |
| `shaylan_weekly_v3_20260402.html` | v3 | Supabase, framework skeleton, Browse exercises button |
| `Cadence_Weekly_v3_20260402.html` | v3 | Supabase, framework skeleton, Browse exercises button |
| `SJR_Library_Master_v4_20260402.html` | v4 | 67 cards, quality tags, 6-quality filter, hidespinal param |
| `SJR_Dashboard_v1_20260402.html` | v1 | All 3 athletes, auto-refresh 60s, injury log, CSV export |
| `patrick_protocol_v2_20260402.html` | v2 | Floating This Week button |
| `SJR_Periodization_Master_v2_20260313.html` | v2 | Deep-link URL params to Library |
| `Yari_weekly_v1.html` | v1 | Isolated silo, localStorage only, not yet Supabase-wired |

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

// NEVER — causes UTC/Pacific timezone shift
new Date('2026-03-23')           // string constructor
d.toISOString().slice(0,10)      // UTC offset bug
```

### Week base dates
- Patrick: `new Date(2026, 2, 23)` — Mon Mar 23 2026
- Shaylan: `new Date(2026, 2, 9)` — Mon Mar 9 2026
- Cadence: `new Date(2026, 2, 16)` — Mon Mar 16 2026

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
- Run `node --check filename.js` on every script block before finalising
- Duplicate script blocks cause `Unexpected token '<'` — the most common build error

### localStorage
- Used as offline fallback cache only — never primary store
- Prefixes: `pt_` (Patrick), `sh_` (Shaylan), `cad_` (Cadence), `yari_` (Yari)

### Day labels
- FAB bar: `['M','T','W','Th','F','Sa','Su']` — NOT `['M','T','W','T','F','S','S']`
- CSS: `font-size:.62rem; letter-spacing:-.02em` to fit longer labels

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

## Library Filter System
URL parameters for deep-linking:
- `?phase=phase-bridge,phase-gpp` — filter by training phase
- `?quality=quality-strength,quality-power` — filter by training quality
- `?hidespinal=1` — hide spinal load filter row (used by girls' guides)
- `?intensity=intensity-sub` — filter by intensity

Quality tags: `quality-gpp`, `quality-hypertrophy`, `quality-strength`, `quality-power`, `quality-velocity`, `quality-isometric`

Phase tags: `phase-rehab`, `phase-bridge`, `phase-gpp`, `phase-spp`, `phase-comp`, `phase-trans`, `phase-maint`, `phase-perf`

## Training Quality → MED (Zourdos et al., FAU)
| Quality | Sets | Note |
|---------|------|------|
| Strength | 3–5 | Pronounced diminishing returns beyond this |
| Hypertrophy | 4 fractional sets MED | More volume rarely adds proportional gain |
| Speed/Power | Low volume, maximal intent | Full recovery between reps — CNS dominant |
| Isometric | 5×45s | Analgesic window is the target, not fatigue |
| GPP | Volume over intensity | Tissue tolerance is the goal |

## Expert Reference Pool
Baar, Grey, Ward, Natera, Barr, Schexnayder, McGill, Alfredson, Rio, Uthoff, Bosch, Dietz, Winkelman, Zourdos

## File Naming Convention
`SJR_[DocumentType]_[Athlete/Scope]_v[Version]_[YYYYMMDD].html`

## Commit Message Convention
`[scope]: what changed + why`
Examples:
- `Patrick v5: fix week base date UTC offset`
- `Girls v3 patch: Library browse same-tab, Th/Sa/Su day labels`
- `Library v4: quality tags + Quality filter row`

## Queued Work
- Yari weekly planner → Supabase wiring
- Periodization Guide → Library nav buttons
- Library high-value exercise additions (incremental)
- VBT persuasion deck (separate thread)
- Rosanne workout guide (new athlete, separate profile)
- CLAUDE.md itself should be committed to the repo
