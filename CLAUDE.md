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
Weekly schedule: Mon/Wed/Sat gym · Tue/Thu canal + Yari (4×4 VO2 max intervals, HR monitor) · Fri recovery (walk + relaxing movements only) · Sun rest + MOBILITY_LIGHT.
Backward work at gym: Matrix treadmill (club) — NOT sled. Sled is canal days only (Tue/Thu).
90/90 Hip Transition deferred — mobility not yet warranting it. Revisit when range improves.
Canal days (Tue/Thu with Yari): VO2 max 4×4 intervals replacing forward run intervals. 4 min work / 3 min rest × 4 rounds · ~2 mi total · target >90% HRmax. Pain levels holding ≤4/10. HR frequently >160 bpm — aerobic base + VO2 max stimulus.

## Athletes
| Athlete | Sport | Injury | Status | Target |
|---------|-------|--------|--------|--------|
| Patrick | Volleyball | L4-L5 spinal rehab (foraminal stenosis) | Bridge W8 · **MBB done Jun 5 → only ~30% relief ×4hr (NEGATIVE facet block)** · physio stumped · next doc consult **Jul 28** · left-side push-off flareup edge · **primary app user going forward** | King of the Court, Summer 2026 |
| Shaylan | Sprint/Jump (MJC → **UC Berkeley fall 2026**) | **R navicular stress fx (nondisplaced, MRI 6/15/26)** | **Strict NWB 6 wks (boot+crutches) → reexam ~late July** · core+upper cleared, leg tier verbally cleared (pool out) · RED-S neg · dietitian ref · `boot_phase_v1` block built | 11.29 100m PR · State champion 100m · 2nd 200m + LJ |
| Cadence | Sprint/Jump (Cal Poly — **graduated**) | Plantar fascia + shin load intolerance | Commonwealth Games prep · future training situation TBD | Commonwealth Games Glasgow, July 2026 |
| Yari | Soccer (professional) | ACL rehab | **Phase 3 complete · returning Mexico June 9+ (possibly 12–15)** · "never felt stronger/faster" | Club integration Jun 15–21 (W9) · report: strongest/fastest she's felt |
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

## File Inventory (canonical — May 2026)
| File | Version | Notes |
|------|---------|-------|
| `SJR_WeeklyGuide_Patrick_v5_20260402.html` | **v6.0** | **Wave-periodization engine** — date-driven 3-build+1-deload undulation (`waveInfo`, anchored Mon Mar 23, never freezes); DUP map Mon heavy/Wed moderate/Sat light-power, Tue/Thu canal (separate aerobic track), Fri/Sun recovery · **downregulate-only governor** (`governorVerdict`) folds VBT readiness + pain into ONE headline verdict + single light; green-day discipline message (consecutive-green streak → "+5% next week, not today's ceiling test") · soft override (logs to `pt_wave_overrides`, today-pruned) with **hard ACWR floor as labeled placeholder** (needs AU session logger, not yet built) · **dating-freeze killed**: past authored horizon (Jun 14) `detectCurrentWeek` no longer returns null — clamps content to last authored week, drives dates/headline from live wave (`pastHorizon`/`liveMonday`/`currentWeekStart`), carry-forward banner · metric-strip demoted into headline "why ▾" drawer (logging still one tap via ＋Log) · **bugfix: moved `init()` to end of script** (renderWaveHeadline reads vbtLog during init → was TDZ-crashing on past-horizon load) · prior v5.12: | VBT readiness panel (velocity vs rolling baseline + proxy fallback, traffic light) · per-exercise saved demo URLs (`pt_demos`) · day-of add/remove overrides (`pt_dayover`, today-only, auto-prune) · P3 metrics modal (RSI/LSI/MV/custom, `pt_metrics`, CSV export w/ confirm) · **injury modal restored** (markup lost in May 12 conflict; fixed dead refs: todayStr→todayDateStr, showSyncBadge→showSyncStatus, added sbDateStr, loadInjuryLogs now called in init) · **v5.11**: Flareup Recovery Tracker (episode list + trend arrow, reads `pt_logs` morning + `pt_injuries`) · **v5.12**: Sciatic Nerve *Slider* — upgraded the old floss into a reciprocal glide (sliders-not-tensioners), wired to the crossed-leg/sock/pre-run neural-tension provocation; in MOBILITY_LIGHT · **Library access**: persistent 📚 FAB in the day view (class `browse-btn`, so the previously-dormant injury phase-filter now activates) |
| `SJR_VBT_Tracker_v1_20260609.html` | **v1.0 NEW** | Optical VBT: phone camera tracks lime-green bar marker, scale from known ⌀, mean concentric velocity per rep, 20% velocity-loss audio cutoff, auto-writes `pt_vbt_today` → guide readiness panel reads it (same-origin localStorage) |
| `shaylan_weekly_v3_20260402.html` | **v3.3** | W11 off-week + W12 return-to-form + W13 Sacramento (conditional) added |
| `shaylan_boot_phase_v1_20260616.html` | **v1.1** | 6-wk strict-NWB navicular block (R navicular SF, nondisplaced, MRI 6/15 · Falcocchia/KP) — core + controlled upper-body lifting cleared; 4-day template (push/NWB arm-bike conditioning/pull/hypertrophy+mobility) + 6-wk volume progression; leg tier (L-leg loaded + R-leg open-chain knee/iso, zero foot/ankle load) **verbally cleared, reconfirm in writing**; pool ruled out; bone-fueling note (RED-S neg, dietitian ref); reexam-prep checklist (imaging-before-WB, return-to-run protocol) · medical-deference framing · **v1.1 (Jun 17): cross-education built in** — "Why the legs don't rest" section (neural contralateral protection + navicular tension-vs-weight explainer: tib post = only tendon on navicular → resisted ankle/foot work loads it even NWB → right foot/ankle stays passive), leg tier upgraded to eccentric-biased heavy LEFT-leg (cross-ed engine) + foot-passive right iso + quad NMES (ask-PT) + NMES reexam Q. Filename unchanged (stable link); footer reads v1.1. Suggested commit: `Shaylan boot v1.1: build cross-education into leg tier + navicular tension explainer + NMES option` |
| `Cadence_Weekly_v3_20260402.html` | v3.2 | Supabase · SHIN_COMP · MULTIPLANAR_LOWER · EX_INFO entries |
| `SJR_Yari_Guide_v2_20260414.html` | **v2.7** | W5–W9 added (May 18–June 21) · Hip CARs + Ankle CARs + 90/90 Hip Switch + Lateral Lunge + Copenhagen Plank (Harøy 2019) + Conor Harris glute med (ant/post fibers) + Half-Kneeling Chop across all new weeks · Library nav link added |
| `SJR_Library_Master_v4_20260402.html` | **v4.2** | 82 cards · quality tags · filter FAQ panel · +Wall Sit Co-Contraction Ladder (Grey) · +Sciatic Nerve Slider / Neural Glide (Mobility & Joint Prep) · top nav (referrer-aware ← Back · Dashboard · Program Overview) |
| `SJR_Dashboard_v1_20260402.html` | **v1.3** | All 4 athletes · auto-refresh · Yari Gate Assessment nav link added · sbFetch Authorization:Bearer removed |
| `patrick_protocol_v2_20260402.html` | v2 | Floating This Week button |
| `SJR_Periodization_Master_v2_20260313.html` | v2 | Library links fixed to absolute URL v4.1 |

### Version numbering convention
- Bump **date suffix** for fixes/patches: `_v3_20260402` → `_v3_20260414`
- Bump **version number** for structural changes: v3 → v4
- Overwrite via GitHub Desktop — never delete-then-upload on mobile

### Naming convention — no underscores in FILE NAMES (Patrick's preference, Jun 2026)
**Scope = the file names Patrick sees in his folder.** New files Claude creates should use hyphens, not underscores — kebab-case (`shay-crosseducation-evidence-20260617.md`), `-vN-YYYYMMDD` suffix for brand-new files. He finds underscores in filenames grating; everything else is fine.
- **Behind-the-scenes underscores are totally fine** — code identifiers, CSS classes/IDs, localStorage keys (`pt_`, `sh_`…), Supabase tables/columns (`pain_logs`, `injury_logs`…), anything Patrick doesn't read as a filename. Use whatever's idiomatic. The "unless technically required" escape hatch still applies (e.g., Python snake_case).
- **Forward-looking only** — do NOT rename existing files. Live filenames are on GitHub Pages; renaming breaks URLs/bookmarks and triggers the `(1)` duplicate on re-upload. Existing `_vN_YYYYMMDD` filenames keep their underscores.
- Net: only *new file names* go hyphenated; the repo's existing names and all internal naming are untouched.

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
**82 cards** across 11 sections:
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

## Expert Reference Pool (26)
Baar · Grey · Ward · Natera · Barr · Schexnayder · McGill · Alfredson · Rio · Uthoff · Bosch · Dietz · Winkelman · Zourdos · Spina · Boyle · Cressey · Shepherd · Mack · Elliott · Harris · Verkhoshansky · Zatsiorsky · Gabbett · Sims · Pfaff

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
| Elliott (P3) | Deceleration as primary injury mechanism, force absorption, force-plate asymmetry screening — complements the production-focused pool |
| Harris | Glute med fiber-specific programming — fire hydrant = anterior/superior fibers, hip extension+abduction = posterior fibers (applied Yari W5–W9) |
| Verkhoshansky | Shock method / plyometrics theory, amortization phase as the actual training target — theoretical basis for what Elliott measures |
| Zatsiorsky | Force-velocity curve, strength zone classification — foundation for VBT autoregulation (Mann, Gonzalez-Badillo built on his framework) |
| Gabbett | ACWR — load spike vs. absolute load as injury predictor; sweet spot 0.8–1.3, >1.5 danger zone; session RPE×duration (AU) method |
| Sims | Female athlete physiology, menstrual cycle periodization, hormonal effects on tissue vulnerability — 3 of 4 athletes are female |
| Pfaff | Sprint/jump ground contact mechanics, approach run, elite load management — more current and technically detailed than Schexnayder |

## Commit Message Convention
`[scope]: what changed + why`

Examples:
- `Patrick v5.3: auto-stage on metric switch, remove Add Another Metric button`
- `Library v4.1: +13 exercises, retag intensity/quality, remove spinal filter UI`
- `Cadence v3: fix async saveGateLog — Supabase logs now saving`
- `Periodization v2: fix Library links to absolute URL v4.1`
- `CLAUDE.md: update to April 2026 state`

### Session Orientation — run this first
At the start of any session, run `git log --oneline -20` to see recent commits before accepting Patrick's verbal description of what's changed. Patrick's descriptions are directionally accurate but may omit details — the commit log is ground truth. Cross-reference against the File Inventory above to catch version drift.

```bash
git -C "C:/Users/padra/Documents/GitHub/sjr-system" log --oneline -20
```

### Recent Commit Log (May–June 2026)
Branch in sync with origin/main through `8bab5f7` (June 15 2026). The v5.12 / Library-v4.2 work below is **uncommitted** — push from GitHub Desktop. (Git index had corrupted mid-session via the sandbox; rebuilt with `git reset` June 15.)

| Hash | Message |
|------|---------|
| _pending_ | **Patrick v6.0.3** (uncommitted — push via GitHub Desktop): Gate-banner trim. Wave headline `＋ Log` and the gate cluster `Log` button both called `openModal()` — duplicate pain-log entry. Removed the gate `Log`; wave `＋Log` (line ~528) is now the sole pain-log entry point. Collapsed the gate cluster from two rows to one: ⚠ Issue · 🎯 Ready · 📊 Data. Suggested commit: `Patrick v6.0.3: drop duplicate gate Log button, collapse gate cluster to one row (Issue/Ready/Data)` |
| _pending_ | **Patrick v6.0.2** (uncommitted — push via GitHub Desktop): `.modal` bottom-sheet was unbounded (parent `align-items:flex-end`, no max-height/overflow) → tall content (Pain/Issue/Data modals, shared class) overflowed off the TOP of the viewport, clipped under the backdrop blur and unreachable on mobile until a resize. Added `max-height:90vh; max-height:90dvh; overflow-y:auto; -webkit-overflow-scrolling:touch;`. `dvh` accounts for mobile browser chrome; `vh` fallback. Suggested commit: `Patrick v6.0.2: cap .modal height to viewport + scroll overflow (fixes off-top clipping of tall modals on mobile)` |
| _pending_ | **Patrick v6.0.1** (uncommitted — push via GitHub Desktop): Flareup tracker trigger widened from Back-only to ALL pain-log metrics (Back/Nerve/Glute/Ankle ≥3) + Issue regions back/hip/knee/shin/foot ≥3. Was showing empty while Patrick logged Nerve/Glute/Ankle ≥3 since Jun 12 — only `metric==='morning'` and back/hip injuries counted. `computeFlareupEpisodes` now keys on a per-date MAX symptom score (recovery requires *all* inputs ≤2 on two consecutive logged days — a high nerve day can't be falsely resolved by a low Back log). Glute included deliberately (Patrick: high glute reading = pain-driven guarding/AMI, not just weakness). Suggested commit: `Patrick v6.0.1: flareup tracker counts all pain metrics (Back/Nerve/Glute/Ankle) + lower-quarter Issues, not Back-only` |
| _pending_ | **Patrick v6.0** (uncommitted — push via GitHub Desktop): Wave-periodization engine + downregulate-only governor + headline-verdict UI + dating-freeze fix + init() TDZ bugfix. Suggested commit: `Patrick v6.0: date-driven wave engine + green-day governor; kill dating freeze; move init() past vbtLog TDZ` |
| 2b9379b | Patrick v5.12 + Library v4.2: Sciatic Nerve Slider (neural glide, sliders-not-tensioners) + crossed-leg/sock provocation coaching · Library → 82 cards (was wrongly logged _pending_; landed Jun 15) |
| 949ca56 | Create Shay_PT_Questions_20260615.md |
| 8bab5f7 | Patrick v5.11: Flareup Recovery Tracker — episode list + trend arrow |
| eaa6b65 | Library: Wall Sit Co-Contraction Ladder (Grey) → 81 cards |
| 34d8fde | CLAUDE.md: MBB negative + push-off flareup + Grey co-contraction · Library +Wall Sit |
| 58eb32c | Update CLAUDE.md |
| a61d062 | Yari v2.7: W8–W9 extended stay/club prep · Copenhagen Plank + Harris glute med all W5–W9 · Library v4.1: filter FAQ panel (combined commit) |
| 7ae7344 | Dashboard v1.3: Yari Gate Assessment nav link |
| c850728 | Patrick v5.9: upper body W8–W10 · bench+row (Mon/Sat) · row+Pallof (Wed) · deload scaled W10 |
| 20cb803 | Shaylan v3.3: W11 off-week + W12 return-to-form + W13 Sacramento (conditional) |
| b974b50 | Yari v2.5: Terrain Walk Eyes-Closed added W3–W4 Tue/Thu canal days |
| fceebee | Patrick v5.9: W8–W11 Bridge weeks + inline week nav |
| c287f01 / 46d35c9 / 0ef59e6 / 84a39ad | Cache-bust iterations |
| 19f46e3 | All guides + dashboard: daily cache-bust redirect — bookmarks always load latest |
| 46c2d6f | Patrick v5.8: Tue/Thu canal = VO2 max only · ankle hops → Mon gym · curved runs removed |

Note: Yari v2.6 never landed as a separate commit — its content (W5–W9, Joint Prep multi-planar, Library nav link) shipped inside a61d062/earlier commits.

### Upload conflict note (2026-05-12)
Patrick uploaded a guide from an older chat session via GitHub Desktop, landing *after* Cowork session commits and overwriting 1,271 lines of EX_INFO + breaking Yari's HTML. Restored from `6ca4a13` / `cbacfd2`. **Rule: the sjr-system folder is the only source of truth — delete all old copies outside it.**

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
- [~] LOW: CSV export confirmation prompt before download — done for Patrick guide metrics CSV (v5.10); Dashboard injury CSV still open
- [ ] LOW: Consider self-hosting Google Fonts

### Active session rules
- Any fix must be matched by a changelog entry in CLAUDE.md and a checklist update above.
- User/stored data must render via textContent, never innerHTML.
- Default to zero-dependency, free solutions.
- Flag any deviation from these rules before proceeding.

---

## Resources & Research Pipeline

### Books Applied to System (confirmed)
| Book | Author | Chapters Used | Applied To |
|------|--------|--------------|------------|
| *Built from Broken* | Scott Hogan | Ch. 4–10 (tendons, cartilage, muscle, bone, ligament, nerve, inflammation) | MOBILITY_LIGHT additions (thoracic ext, femoral nerve floss, couch stretch); confirmed ISO and collagen protocols already aligned |
| *Back Mechanic* | Stuart McGill | Full | Patrick spinal protocol, Big Three, neutral spine, spinal load classification throughout |
| *The Sports Gene* | David Epstein | Context only | Athlete development framing — not directly applied |

### Key Papers in Active Use
| Paper | Finding Applied |
|-------|----------------|
| Rio et al. (2015) — BJSM | Isometric analgesia: 5×45s at mid-angle reduces cortical inhibition; applied to Wall Sit (Yari), Isometric Wall Sit nerve check (Patrick) |
| Shaw et al. (2017) — AJSM | Collagen synthesis: 15g hydrolyzed + 200mg Vit C, 60 min pre-load doubles collagen markers; applied to all collagen:true days |
| Alfredson et al. (1998) | Eccentric heel raise protocol; basis for soleus/gastroc eccentric work (Cadence, Shaylan) |
| Zourdos et al. (FAU JSHS 2024) | MED framework — strength 3–5 sets, hypertrophy 4 fractional, speed/power low volume high intent; applied to all block design |
| Baar — LOX upregulation | Stiff ankle hops post-collagen upregulate LOX → collagen crosslinking; applied to ANKLE_HOPS protocol |
| Petersen et al. (2011) | Nordic hamstring curl dose-response; basis for Yari Nordic eccentric protocol |

### Research Pipeline — Bookmarked for Investigation

These are areas where evidence is evolving or where deeper review may update current practice. Not action items yet — flag when relevant to a programming decision.

#### Spinal Rehab (Patrick) — ACTIVE EDGE: left-side push-off flareup (Jun 2026)
- **Pattern**: mini-flareups, left side, on moderate-to-high-intensity single-leg push-off into sprint. ×2 in 2 weeks. Patrick's described mechanics: hip hinge (flexion) → knee flexion → external rotation → full extension. The terminal external-rotation + full-extension under high force is the aggravator.
- **Mechanism (UPDATED post-MBB — now tilts foraminal/radicular)**: extension + same-side rotation + same-side side-bend both *closes the foramen* (→ nerve root irritation) AND loads the facet. The Jun 5 MBB was the discriminator between them. Result: **~30% relief for ~4hr — a NEGATIVE facet block** (diagnostic threshold is ≥50%, strict standard ≥80%; ≥80% predicts RFA success, <50% does not — Cohen 2008 / Spine Intervention Society). The 4hr window matching anesthetic half-life confirms the drug was active, so the 30% is real, not a technical miss. Read: **facets are at most a minor contributor (~the 30%); the dominant generator is more likely the nerve root / foramen**, which an MBB can't touch by design. This tilts the ESI-vs-RFA gate (below) toward **transforaminal ESI**, away from RFA. Caveat: poor MBB can also be false-negative (level/placement) or reflect mixed/neuropathic/central or extra-spinal sources (SI, hip) — "physio stumped" is consistent with a mixed picture. Not a verdict; this is the reasoning to bring to the **Jul 28 consult**.
- **Grey tie-in**: this is the co-contraction failure mode in vivo. When the left side can't sequence propulsion through the hip (glute-driven extension, knee a stiff strut), force leaks into terminal lumbar extension-rotation — the spine finishes the push the hip didn't. Grey's "delay knee extension, drive through hip" is, for Patrick specifically, a spine-protection strategy.
- **Edge / gate**: treat as a **hard autoregulation cutoff** to high-intensity single-leg push-off until post-procedure — NOT a push-to-4/10 situation. Rebuild biased toward hinged-forward, neutral-trunk propulsion: anti-rotation (Pallof, already carried), glute-driven hip extension, avoid terminal lumbar extension under speed. Wall Sit Co-Contraction Ladder (new Library card) is an on-ramp for the strut pattern.
- **Neural-tension corollary (Jun 15 2026)**: Patrick reports a second provoker — left leg crossed over right, slightly flexed (sock, washing foot, pre-run stretch), felt in the *back*, worse the further he goes. That's a slump/SLR neural-tension position. Key insight: it looks like the opposite of the push-off flareup but it isn't — push-off (extension + rotation) *closes* the foramen and **compresses** the root; crossed-leg (flexion + reach) **tensions** the same root. Two opposite movements, one irritable nerve, from two directions — exactly the foraminal/radicular-dominant picture the negative MBB implied; the body echoing the block's verdict in movement form. Management: STOP forcing the crossed-leg stretch (it sensitizes), use sciatic **sliders** not tensioners (pain-free, stop if it peripheralizes down the leg), and build left-hip flexion/ER capacity so the spine stops borrowing range it should supply (hip-spine syndrome). Shipped to guide v5.12 + Library v4.2.
- **No near-term intervention**: MBB done and equivocal; next consult not until Jul 28, so any next injection (likely ESI) lands August+ at earliest. **Training IS the management through late summer** — the conservative gate above isn't a holding pattern waiting for a procedure to fix things, it's the actual plan. Build capacity, protect the foramen, hold the line on terminal extension-rotation under speed.

#### Spinal Rehab (Patrick) — research bookmarks
- **Foraminal stenosis — decompression loading specificity**: What direction and load magnitude optimally opens the L4-L5 foramen? Backward sled vs. backward treadmill vs. aquatic — comparative decompression studies limited. Worth tracking as Patrick transitions modes.
- **ESI vs. radiofrequency ablation outcomes**: Comparative RCT data for foraminal stenosis specifically (vs. central stenosis, which is better studied). Cochrane reviews updated 2023–2024. **June 2026 update: the equivocal MBB (30%/4hr, negative) effectively argues this gate toward transforaminal ESI — RFA is poorly indicated when the diagnostic block is sub-50%. Confirm direction at Jul 28 consult.**
- **Gabapentin taper and sensorimotor function**: Any evidence on proprioceptive blunting during/after gabapentin? Relevant to Patrick's balance and single-leg work timing.
- **Kettlebell deadlift vs. trap bar for lumbar**: McGill's spinal load data on KB swings/deadlifts vs. trap bar. Trap bar elevated start currently used — confirm it remains lowest compressive option.

#### Tendinopathy (all athletes)
- **Heavy slow resistance (HSR) vs. isometric**: Cook, Docking, Rio — the continuum model debate. Is there a reactive vs. degenerative distinction that changes iso dose? Docking's 2022 update worth reviewing.
- **Collagen timing window precision**: Baar's 45–60 min window — is there evidence on whether 30 min or 90 min changes outcomes? Any sex-specific timing data (relevant to Shaylan/Cadence/Yari)?
- **Estrogen-LOX interaction** (Baar): Female athletes may have reduced LOX activity at certain cycle phases, impairing collagen crosslinking post-load. Practical implications for Shaylan/Cadence/Yari collagen protocol timing. **Needs deeper review.**

#### ACL Rehab (Yari)
- **LSI threshold debate**: 90% vs. 95% limb symmetry for return to sport. Recent meta-analyses (van Melick 2022) suggest LSI alone is insufficient — psychological readiness (ACL-RSI ≥65) and hop battery together. Currently both in guide.
- **Re-injury rate at 9 vs. 12 months**: Grindem et al. data on timing. Yari's Phase 3 gate approaching — confirm current RTP criteria align with best available evidence.
- **Hamstring co-contraction and ACL protection**: The mechanism behind supine extended leg pulses (pumping the brakes) — deceleration-range hamstring iso. Hewett's work on neuromuscular training and ACL re-injury rates.
- **Split squat ISO and knee valgus control**: Any EMG studies on split squat iso position and VMO/glute med activation compared to standard wall sit? Relevant to Yari's new iso progression.

#### Immobilization & Cross-Education (Shaylan — R navicular boot phase) ★ Priority — ✅ DUG Jun 17 2026 → `Shay_CrossEducation_Evidence_20260617.md` (repo root): evidence summary for skeptics + "what Shay can do now". Key cites: Farthing & Chilibeck 2009, Carr 2025 (female pilot), Magnus 2010, Manca 2021 Delphi, Altheyab 2024 (lower-limb meta), Dirks 2014 (NMES), Sugiyama 2010 (bone is site-specific). **Manca 2021 full text obtained Jun 18 (uploaded PDF) → dose now precise: 3 sessions/wk · heavy · eccentric-biased · 4–6 wks / 13–18 sessions (matches the boot window); maximizers = high-intensity (90% panel agreement) + eccentric (84%) + mirror illusion (88%); explicitly endorsed for orthopedic (82%)/sport-injury (93%); no consensus that sex changes the protocol; asymmetry agreed a worthwhile trade. Folded into guide v1.1 (leg tier → Days 1/3/4 ≈3×/wk + mirror cue) and the evidence doc.** Still want Carr 2025 full text (exact protocol + recovery effect size). Verdict: cross-education protects strength/neural drive (~10–15%, neural mechanism, eccentric transfers best), NOT navicular bone (separate track). Open: written MD clearance on open-chain leg tier + whether proximal work sneaks foot load. ✅ BUILT INTO boot guide v1.1 (Jun 17): new "Why the legs don't rest" section (cross-ed rationale + navicular tension-vs-weight explainer — tib post is the ONLY tendon on the navicular, so resisted ankle/foot work tensions the healing bone even NWB; rule = right foot/ankle stays passive), leg tier upgraded to eccentric-biased heavy LEFT-leg work (the cross-ed engine) + foot-passive right-leg iso + quad NMES (ask-PT), NMES added to reexam checklist.
Patrick's question (and the long-standing debate with a past physio/trainer who was "in disbelief"): when one leg is immobilized/NWB, **why let BOTH legs atrophy?** Train the healthy leg hard — is there crossover, even neural, that protects the immobilized side? And are there ways to biomechanically load the immobilized limb *without* compromising the navicular?
- **Cross-education of strength (the answer that vindicates Patrick's instinct)**: unilateral resistance training produces strength gains in the *untrained* contralateral limb — typically ~10–15% of trained-side gains, mechanism predominantly **neural** (corticospinal excitability, interhemispheric facilitation, reduced interhemispheric inhibition), not hypertrophic. Search anchors: **Farthing & Chilibeck** (the key immobilization work — casting one limb, training the free limb *attenuates* strength + muscle loss in the immobilized one), **Hortobágyi**, **Carroll & Taylor** (neural mechanisms), **Andrushko** (recent ACL/immobilization cross-education), **Green & Gabriel 2018** review, **Manca et al. 2021** meta. This is gold-standard lit, not a fringe claim — the disbelieving physio was on the wrong side of ~40 years of evidence.
- **Direct clinical relevance**: train Shaylan's LEFT (healthy) leg with intent — heavy unilateral knee/hip work — explicitly as a contralateral-protection strategy for the immobilized RIGHT, on top of the general systemic + RED-S/bone-fueling case for staying loaded. Frame in the boot_phase guide as evidence-based, not improvised.
- **Loading the immobilized limb without loading the bone**: open-chain R-leg knee extension/flexion + quad/glute isometrics with **zero foot/ankle ground reaction** (the navicular sees no compressive/bending load) — the "leg tier verbally cleared" item. Also: electrical stim / voluntary isometric ramps to blunt disuse atrophy. Question to resolve: how much proximal (hip/knee) open-chain load is genuinely navicular-safe, and does any of it sneak load through the foot via long-flexor/intrinsic co-contraction? Confirm against the MD's written clearance.
- **Bone angle**: does contralateral or systemic loading do anything for bone (vs. muscle/neural)? Bone adaptation is largely site-specific to mechanical strain, so cross-education almost certainly does NOT protect the navicular's bone density — that's the dietitian/RED-S + eventual progressive reloading lane. Keep the two goals distinct: cross-education preserves *strength/neural drive*; only direct (later, graded) loading rebuilds *bone*.
- **Deliverable when dug**: short evidence summary Patrick can hand the skeptics + a "what Shay can safely do now" addendum to boot_phase_v1. Search BJSM/JOSPT/PubMed first, cross-ref Farthing immobilization papers by name.

#### Sprint / Jump (Shaylan, Cadence)
- **Shin splints (MTSS) — bone stress vs. muscle model**: The tib post tension model (currently guiding our tib post iso work) vs. the tibial bone bending model. Recent imaging studies (MRI bone stress markers) may update loading prescription. Barrie & Meeuwisse 2019 worth reviewing.
- **Tibial bone stress capacity building**: Progressive impact loading protocols for MTSS prevention — what's the minimum effective stimulus? Fredericson's grading and return-to-run protocols.
- **Penultimate step mechanics** (Shaylan LJ): Schexnayder's work on COM lowering strategy. Any recent 3D kinematics data on optimal penultimate step length-to-height ratio?
- **Plantar fascia loading protocols** (Cadence): Rathleff et al. high-load strength training (single-leg heel raise with towel curl) — already partly applied. Baar collagen timing for PF specifically — less studied than Achilles.
- **Nordic hamstring curl — hamstring strain prevention in sprinters**: Any evidence specific to LJ/sprint athletes vs. soccer? Dose and timing relative to competition.

#### Co-Contraction & Movement Sequencing (Grey) ★ vetted June 2026
- **Grey's knee-as-isometric-strut model**: at foot strike, calf + hamstring co-contract to hold the knee near-isometric so the glute drives hip extension, rather than the quad extending the knee early ("delayed knee extension"). Vetted against Coach Em Up Ep 60 + Jacked Athlete #124 (Feb 2025) + sprint biomechanics literature.
- **Verdict**: the *descriptive* biomechanics hold up well — knee operates through tiny excursion in stance (stiff strut), high hamstring/gastroc co-activation is documented, hip extensors are primary propulsors. Aligns with Bosch's coordination model. The *intervention* claim ("train to delay knee extension → move better, fewer injuries") is a mechanistically sound coaching heuristic, NOT RCT-backed. Apply as a lens, flag as unproven — same bar as the rest of this pipeline.
- **"For the tendon it's about load, not biomechanics"** — squarely consensus, no dispute.
- **Isometric analgesia reality-check**: Rio 2015 (the 5×45s basis in our guides) was 6 in-season male volleyballers; Holden 2019/2020 + later meta-analyses found isometrics NOT reliably superior to isotonic for pain. Grey himself now chases *load without pain* over pain-as-progress and warns a wall sit can flare an unready patellar tendon — better aligned with the evidence than the protocol he's credited with. Keep isometrics as an option, not a magic switch.
- **Applied**: Wall Sit Progression — Co-Contraction Ladder card added to Library (Isometric Holds, 81 cards). Direct relevance to Patrick (knee strut / spine-protective sequencing — see push-off flareup below) and the sprint athletes (stance co-contraction).
- **Already in system**: Grey cited for skater squat (Library). Co-contraction appears in McGill side-plank / adductor contexts but the knee-strut framework was not explicit until now.

#### Motor Learning & Coaching
- **External vs. internal focus cueing** (Winkelman): Sprint mechanics cues that hold up under fatigue — research on dual-task degradation of internal cues. Relevant for meet-day vs. practice coaching approach.
- **Blocked vs. random practice for sprint mechanics**: Any updated data since Winkelman's work? Implications for Shaylan's approach run consistency problem (scratches at board).

#### BFR / Occlusion
- **Optimal cuff pressure for hypertrophy vs. pain management**: Loenneke's pressure recommendations. Elastic bands (current use with Yari) vs. pneumatic cuffs — pressure equivalence data limited.
- **BFR and bone density**: Emerging evidence on BFR + impact for bone adaptation. Relevant for Cadence/Shaylan shin load intolerance.

#### Multi-Planar Work — Mobility & Strength at End-of-Range ★ Priority
This is an identified gap across the entire system. Most current programming is sagittal-dominant. Two distinct problems to solve:

**1. Multi-planar mobility** — joint access to frontal and transverse plane ranges under load, not just passive end-range.
**2. Strength at end-of-range** — Spina's PAILs/RAILs framework. The gap between passive ROM and active (loaded) ROM is the injury zone. Closing it requires isometric contractions *at* end range, not through mid-range.

Athlete-specific applications:
- **Patrick**: Thoracic transverse plane (already started — Quadruped Thoracic Rotation). Next layer: active thoracic rotation strength (not just passive). Frontal plane hip loading (lateral lunge, lateral step-up) to reduce spinal load via hip abductor recruitment. Avoid lumbar rotation end-range loading near the stenotic foramen.
- **Yari**: Frontal plane is the ACL protection plane — valgus is a frontal/transverse event. Deliberate frontal plane single-leg strength (lateral squat hold, frontal plane RDL) as a proactive layer beyond reactive perturbation work.
- **Shaylan/Cadence**: Penultimate LJ step is a frontal plane loading event. Triplanar ankle loading (inversion bias already in — extend to eversion and transverse plane). Multi-directional calf progressions.

Research to dig into:
- **Spina — PAILs/RAILs protocols**: Joint-specific strength at end-of-range. Hip and thoracic spine are the priority joints for this system. How much intensity, how much time under tension, frequency relative to other work?
- **Sahrmann — directional loading specificity**: Loading direction determines adaptation direction. The scientific basis for why sagittal-only training leaves frontal/transverse plane gaps. Movement Impairment Syndromes — relevant to Patrick's lumbar pattern and Yari's valgus tendency.
- **Gary Gray — Applied Functional Science (AFS)**: Triplanar loading as the foundation for functional strength. Chain reaction biomechanics — how foot pronation drives tibial IR drives femoral IR drives hip mechanics. Relevant to both spinal rehab and ACL protection.
- **Craig Liebenson**: Functional rehabilitation, multi-planar movement assessment, integration of mobility and stability in the same movement.
- **Active vs. passive ROM gap as injury predictor**: Is there published data on the size of the passive-active ROM gap predicting injury risk? Spina's clinical claim vs. what's in the literature.
- **Hip CARs in athletic populations**: Controlled Articular Rotations as daily joint health practice — what's the evidence base, what frequency, and does it transfer to athletic performance?
- **Frontal plane loading and lumbar spinal stenosis**: Any contraindication data? Lateral lunge creates frontal plane hip load but may also create some lateral lumbar shear — need to review before programming for Patrick.

*Implementation note (June 2026 — substantially implemented): Patrick: Hip CAR + PAILs + Side-Lying Hip Abduction ISO + MOBILITY_LIGHT additions. Shaylan/Cadence: MULTIPLANAR_LOWER (Lateral Lunge + Side-Lying Hip Abduction ISO) on comp Mondays. Yari: Full Joint Prep block (Hip CARs + Ankle CARs + 90/90 Hip Switch + Lateral Lunge + Copenhagen Plank + Harris glute med anterior/posterior + Half-Kneeling Chop) in all W5–W9 days. Remaining: Patrick frontal plane lateral lunge deferred (lateral lumbar shear contraindication review needed). Thoracic transverse plane active strength not yet built.*

### Key Journals to Monitor
- British Journal of Sports Medicine (BJSM) — tendinopathy, ACL, return to sport
- Journal of Strength and Conditioning Research (JSCR) — periodization, load management
- International Journal of Sports Physiology and Performance (IJSPP) — sprint/jump, elite athlete data
- Journal of Orthopaedic & Sports Physical Therapy (JOSPT) — clinical rehab protocols
- Sports Medicine — systematic reviews across all domains

### Practitioner Sources (primary)
Frans Bosch (sprint coordination) · Stuart McGill (spine) · Keith Baar (tendon/collagen) · Ebonie Rio (isometric analgesia) · Nick Winkelman (motor learning) · Mike Boyle (joint-by-joint) · Greg Rose / TPI model (rotational athletes) · Tim Gabbett (load management, AMS ratio) · Ben Peterson (hamstring) · Michael Fredericson (bone stress)

*Note: When a research question becomes a programming decision, search BJSM and PubMed first, then cross-reference with practitioner application. Flag any finding that contradicts current protocols before applying.*

---

## Working With Patrick

### How Patrick communicates
- Verbal descriptions of what's changed are **directionally accurate but may omit details**. Always cross-reference with `git log` and actual file state before accepting his summary as ground truth.
- He thinks out loud — half-formed ideas are invitations to push back or develop, not instructions to execute blindly.
- "I don't know if we can..." is an opening for a real answer, not a rhetorical softener.

### Interaction preferences
- **Pushback is welcome and expected.** Don't validate wrong moves or bulldoze over mistakes. If a proposal has a problem, name it directly.
- **Act on obvious moves, ask on genuinely ambiguous ones.** Don't ask permission for things that have one clearly right answer.
- **Prose over bullets** in explanations. Use lists only for code, step-by-step sequences, or when Patrick explicitly requests them.
- **Short on well-understood topics.** If Patrick knows the domain, don't re-explain the foundation.
- **Analogies are good.** Abstract concepts land better with a concrete parallel.
- **Research-backed over pop explanations.** Cite the mechanism or the paper when it matters. Ignore Instagram/TikTok as sources.
- **Humor when the opening is there.** Don't force it, but don't avoid it.
- **Monitor context.** Prepare a carryover prompt when approaching 80% and 90% of token limit. Don't let a session die mid-task without a handoff.

### New session opener template
Paste this at the start of any new session:
```
Read CLAUDE.md (sjr-system and StudyLab). Run: git -C "C:/Users/padra/Documents/GitHub/sjr-system" log --oneline -10
Today is [DATE]. Here's what I want to work on: [TASK]
```

---

## Key Decisions Log

Rationale for non-obvious choices — so the next model inherits the reasoning, not just the outcome.

| Decision | Rationale |
|----------|-----------|
| Rejected Tabata for Yari sprint/agility work (June 2026) | CNS cost is real; mechanics degrade rounds 6–8; original Tabata was cycle ergometer at 170% VO2max — not transferable to field work 3 weeks from return. Current RSA + 4×4 covers the same adaptations more safely. Pool/bike Tabata remains valid for central CV stimulus. |
| 1:3 work:rest for RSA agility intro (15s efforts) | Sub-maximal "high tempo" intensity; partial PCr depletion across reps is the RSA stimulus. 1:4 if true sprint velocity. Earned by progressive decel work post-4×4: 5-step → 3-step → side stops → slope finishers, all under neuromuscular fatigue. |
| Copenhagen Plank introduced W5 (should have been Phase 2) | Adductor gap identified late. Harøy 2019: 41% groin injury reduction in soccer at modest dose. Short lever → long lever progression. Now in all W5–W9 gym days. |
| Patrick upper body: supine-only, pull-dominant | Zero axial spinal compression (supine bench). Bench 2×10 "vitamin" dose — maintenance not training. Row 3:2 pull:push ratio to counter guarding/flexion pattern. Pallof press for transverse plane anti-rotation. |
| Patrick inline week nav (removed bottom bar) | Patrick wanted arrows "right where weeks are displayed." Phase-badge in header was the correct target — not a new element. |
| Copenhagen + Harris glute med over standard side-lying only | Side-lying hits mid-fibers. Fire hydrant (hip abduction in flexion) = anterior/superior fibers. Hip extension + abduction = posterior fibers. Lateral Step-Up ISO stays for valgus control. Together = complete glute med arc. |
| Patrick W8–W11 Bridge added | Guide was showing "Unlock W1" on May 12 — correct behavior, wrong content. May 11–June 4 had no defined weeks. Added 4 Bridge weeks; Unlock W1 pushed to index 11 (June 8+). |
| VBT tracker as separate file, not in-guide (June 2026) | Camera permission prompts don't belong in the daily training guide; keeps guide lean and the one-script rule intact. Same-origin localStorage is the bridge — no backend needed. |
| Day-of overrides keyed by date, not [week]-[day] | Date key self-expires (prune anything ≠ today on load). Week/day index would persist a Tuesday override into every future Tuesday view. |
| P3 metrics localStorage-first | Patrick is sole user, single primary device; ship now, zero backend work. Supabase table when the metric set stabilizes. CSV export is the interim escape hatch. |
| Readiness thresholds 95/85% of baseline MV | ~10% MV drop on fixed warm-up load is the consensus meaningful readiness signal; 95% green is deliberately conservative for spinal rehab, 85% red is a loud alarm. Baseline = last 5 same-load (±10%) entries, ≥3 required. |
| Sciatic *slider*, not tensioner, for Patrick's neural-tension provoker (Jun 2026) | An irritable/foraminal root tolerates a *glide* (slider — one end loads as the other unloads, near-zero net tension) far better than a *tensioner* (both ends taut at once). Head-to-head RCT evidence is thin (Basson 2014 critical review), but the low-strain mechanism is sound for a sensitized nerve and matches McGill's "remove the provocateur first" — the crossed-leg stretch Patrick was doing was a self-administered tensioner. |

---

## App Roadmap — Patrick as Primary User

As Shaylan moves to Berkeley, Yari to Mexico, and Cadence's situation TBD, Patrick becomes the primary active user. These are the next development directions in rough priority:

### Expert pool — status
- Elliott (P3), Harris, Verkhoshansky, Zatsiorsky, Gabbett, Sims, Pfaff added to Expert Reference Pool table June 9 2026.
- **Sims flagged as significant blind spot** — female athlete physiology / cycle periodization, 3 of 4 athletes female. Deeper review pending (ties to existing estrogen-LOX pipeline item).

### ACWR session logger (Gabbett)
- End-of-session RPE×duration (AU) logger with rolling 4-week average → acute:chronic workload ratio.
- Sweet spot 0.8–1.3 · >1.5 danger zone. Load *spikes* predict injury, not high absolute load.
- Separate spinal vs. general load tracking for Patrick.
- Candidate feature for Patrick's guide.

**Design thinking — parked Jun 16 2026, Patrick sleeping on it.** Open questions he raised + the frame that resolves most of them:
- **Multiple sessions in one day (hot run AM + light garage lift PM) don't compete — they SUM.** ACWR's atomic unit is the *day*, not the session (Gabbett): total all sessions into one daily AU, then roll. No tiebreak. (Bank-account model, not a contest.)
- **Heat / sleep / stress inflating a session is the FEATURE of sRPE, not a bug.** Internal load (RPE) absorbs context that external load (pace/watts/tonnage) misses; a hot "average" run that felt like RPE 7 *should* log higher. This is precisely why Gabbett uses sRPE for mixed-modal athletes.
- **Deviating from the prescription (adds a set/weight/exercise) is a category error to worry about.** The *logger* records what was actually done (ACWR compares today vs. trailing 28 days — it never looks at the plan). Plan-vs-actual is the *governor's* job (green-day ramp ceiling), a separate consumer of the same number.
- **FitNotes integration = the one genuinely open question.** FitNotes CSV (date/exercise/sets/reps/weight) has richer *tonnage* for lifting, but tonnage can't sum with a 4×4 VO2 canal session — no exchange rate between "5,000 kg moved" and "20 min at 90% HRmax." sRPE *is* the common currency across modalities. Candidate hybrid: FitNotes auto-feeds session *duration* → Patrick adds one RPE tap → app computes AU (an import pipeline, not a quick wire-up). Decision still owed: FitNotes-import+RPE vs. pure in-app 2-tap.
- **HR monitor + morning HRV (Patrick wears HRM every run, logs morning HRV) — these are READINESS inputs, not LOAD inputs.** They feed the **governor** (downregulate-only), not the ACWR number. Tanked morning HRV → governor holds even when the wave says push (autonomic veto). HRV is lagging/morning-after by design, so it gates *today's* go/no-go, not yesterday's load math. In-session HR (time-in-target-zone vs. pace, HR drift on hot days) is the objective cousin of RPE and may be the *better* internal-load capture on interval/canal days, where the monitor won't flatter the effort. Wire HR/HRV into the governor lane when building the logger.
- Also still open from v6.0 deferrals: governor is downregulate-only with **no soft-override lane for canal/aerobic days** (e.g., great sleep but plan cut 4×4→4×1, want to push back UP) — design soft overrides in BOTH directions when building this.

### Wave-periodization engine (Patrick guide) — ✅ SHIPPED v6.0 (Jun 16 2026, uncommitted)
- Built per the locked spec below. Decisions made during build: WEEKS kept as authored *content* (not deleted) — the wave is the *dating + intensity* spine that composes with it; past the authored horizon the engine carries the last authored week forward with an honest "author next block" banner rather than fabricating training. Governor is **advisory** (doesn't rewrite dose strings — surfaces verdict/banners like the existing `getLoadModifier`), so no persisted baseline-multiplier; earned progression is a *message* ("+5% next build week"), not an auto-applied number.
- **Deferred to v6.1 / next sessions:** (1) hard ACWR floor is a labeled placeholder — needs the AU session logger (RPE×duration) which Patrick has mixed feelings about, separate conversation; (2) gate-banner is now partly redundant with the headline ＋Log — candidate cleanup; (3) optional: let ‹ browse further back than the last authored week from live mode (currently one step). 
- **Verification:** new code `node --check` clean + simulated all governor paths (green-streak discipline, red→Day C, canal/recovery, past-horizon). NOT yet smoke-tested in a live browser — do that on first load (watch console; confirm headline renders today's wave position, no white screen, day bar shows correct Jun dates past the 14th).
- Replace fixed dated WEEKS as the only spine. Continuous undulation computed from the date — never "runs out" (kills the FAB/dating freeze where the bar stopped at Jun 14). Logs already date correctly via `todayDateStr()`; that bug was cosmetic, data is safe.
- Planned wave sets the *intended* stimulus; pain-log + VBT governor can **only downregulate** (avoid ACWR boom-bust, Gabbett).
- **Governor nuance (Patrick's own read, Jun 2026):** he over-pushes on consecutive good days → last 2 flares both came after back-to-back greens. So the governor must **cap the ramp rate on green days too, not just cut on red.** The planned ceiling rises *slowly* as capacity proves out (gated to ACWR ≤1.3); two good days in a row is **never** a license to test the intensity/ROM ceiling. The engine is meant to be the discipline Patrick lacks when he feels better — design it to hold the line *for* him, not ask him. (Mechanism tie-in: the left-side push-off flareup is a hard autoregulation cutoff under speed; a green-day rate cap is the same logic applied to the whole-session ramp.)
- **Locked spec (Jun 16 2026):**
  - *Cycle:* 3-week undulating wave + 4th deload, computed continuously from the date (never freezes). Revisit only if progression feels clearly underwhelming — Patrick: "progression really is a feel too," not chasing fireworks.
  - *DUP mapping:* gym (Mon/Wed/Sat) carries the intensity swing — Mon heavy-ish · Wed moderate · Sat light-power. Canal (Tue/Thu) stays aerobic/VO2, governed on a **separate spinal-vs-general load track**. Fri/Sun recovery untouched.
  - *Green-day ramp ceiling (SOFT):* cap planned progression ≤10% week-over-week, only when trailing ACWR ≤1.3. Two greens in a row buys *next* week's +10%, never today's ceiling-test.
  - *Red-day cut depth:* reuse existing VBT tiers — amber −10–20% load, red → Day C (~70–80% of prescribed). Don't invent a second scale.
  - *Override model = two-tier.* Soft cap (10% ramp ceiling) is override-able freely; engine **logs** the override + chosen params. Hard floor underneath: override may bend the comfort ceiling but **cannot push projected ACWR ≥1.5**. Engine computes where the override lands and reports "still sweet-spot, go" vs "crosses 1.5." Rationale: feel is a *lagging* signal (day-2-of-greens feels great because fatigue hasn't surfaced yet); felt sense governs the soft ceiling, ACWR math guards the hard wall. This is the literal implementation of Patrick's "if the override reveals still-acceptable parameters, all is good."

### Velocity Based Training (VBT) — ✅ SHIPPED v5.10 (June 9 2026)
- Readiness panel in Patrick's guide: warm-up MV @ load vs rolling baseline (last 5 entries within ±10% load, min 3). ≥95% green / 85–95% amber (−10–20% load) / <85% red (Day C). ~10% MV drop is the meaningful signal (Jovanović & Flanagan 2014).
- Proxy fallback (sleep/soreness/warm-up feel, 0–6 score) for non-barbell days.
- **`SJR_VBT_Tracker_v1_20260609.html`** — browser port of the OpenCV VBT-Barbell-Tracker concept (Patrick provided README; My Lift paywalled VBT). Lime-green marker of known diameter → mm/px scale → MCV = displacement/time. requestVideoFrameCallback, EMA smoothing, rep state machine (V_START 0.06 / V_STOP 0.02 m/s), min ROM 250mm default, 20% velocity-loss double-buzz (Pareja-Blanco 2017), wake lock, 2-min auto-reset.
- Handoff: tracker writes `pt_vbt_today` {date, mv, load, reps}; guide auto-fills on init (same-origin localStorage across padraik99.github.io).
- Deliberately skipped: fisheye calibration (trend tool, not research), instantaneous velocity (mean is noise-robust at 30fps and is what the load-velocity literature uses).

### Video demos — ✅ SHIPPED v5.10
- Per-exercise "＋ Save my demo" in detail panel → `pt_demos` {name: url}, http(s) validated, escaped on render. Falls back to search link. ✎ to change, empty to remove.
- Still open: Patrick's private YT playlists → make unlisted, then save links per exercise.

### Day-of exercise customization — ✅ SHIPPED v5.10
- `pt_dayover` keyed by **date string** (not week/day index) — only today's key is read, stale keys pruned on load. "✎ Edit today" → − per exercise (strikethrough + ↩ restore in edit mode), add row with datalist autocomplete from EX_INFO keys. User-entered names/doses escaped (escHtml) per security rules.

### Hard data integration (P3-style) — ✅ SHIPPED v5.10 (localStorage-first)
- 📊 Data modal: RSI (flight÷contact), SL Hop LSI (auto side-lag callout, ≥90/95% gates), Bar MV @ load, Custom. `pt_metrics`, 8-entry history with trend arrows, CSV export with confirm prompt (closes audit LOW item for this file).
- Next step when metric set stabilizes: migrate to Supabase `performance_metrics` table for cross-device sync.
- Patrick's motto: *"Do what I can with what I have in the moment."* The system should reflect that — data informing decisions, not replacing them.