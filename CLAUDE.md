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
| Patrick | Volleyball | L4-L5 spinal rehab (foraminal stenosis) | Bridge W8 · medial branch block pending · **primary app user going forward** | King of the Court, Summer 2026 |
| Shaylan | Sprint/Jump (MJC → **UC Berkeley fall 2026**) | Knee rehab + shin splints | Post-season · off-week · Sacramento TBD (Canadian TF Fed reg issue) | 11.29 100m PR · State champion 100m · 2nd 200m + LJ |
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
| `SJR_WeeklyGuide_Patrick_v5_20260402.html` | **v5.9** | W1–W4 Tue/Thu → VO2 max 4×4 structure · W8–W11 Bridge weeks added · inline week nav (removed bottom bar) · upper body W8–W10: Bench 2×10 + Row 3×15 + Pallof 2×10s (supine/pull-dominant, zero axial compression) |
| `shaylan_weekly_v3_20260402.html` | **v3.3** | W11 off-week + W12 return-to-form + W13 Sacramento (conditional) added |
| `Cadence_Weekly_v3_20260402.html` | v3.2 | Supabase · SHIN_COMP · MULTIPLANAR_LOWER · EX_INFO entries |
| `SJR_Yari_Guide_v2_20260414.html` | **v2.7** | W5–W9 added (May 18–June 21) · Hip CARs + Ankle CARs + 90/90 Hip Switch + Lateral Lunge + Copenhagen Plank (Harøy 2019) + Conor Harris glute med (ant/post fibers) + Half-Kneeling Chop across all new weeks · Library nav link added |
| `SJR_Library_Master_v4_20260402.html` | **v4.1** | 80 cards · quality tags · filter FAQ panel added (collapsible "How to use filters" with phase/quality combo examples for self-directed use) |
| `SJR_Dashboard_v1_20260402.html` | **v1.3** | All 4 athletes · auto-refresh · Yari Gate Assessment nav link added · sbFetch Authorization:Bearer removed |
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

### Session Orientation — run this first
At the start of any session, run `git log --oneline -20` to see recent commits before accepting Patrick's verbal description of what's changed. Patrick's descriptions are directionally accurate but may omit details — the commit log is ground truth. Cross-reference against the File Inventory above to catch version drift.

```bash
git -C "C:/Users/padra/Documents/GitHub/sjr-system" log --oneline -20
```

### Recent Commit Log (May–June 2026)
| Hash | Message |
|------|---------|
| pending | Yari v2.7: W8–W9 extended stay/club prep · Copenhagen Plank + Harris glute med all W5–W9 |
| pending | Yari v2.6: W5–W9 added · Joint Prep multi-planar · Library nav link |
| pending | Library v4.1: filter FAQ panel |
| pending | Dashboard v1.3: Yari Gate Assessment nav link |
| pending | Patrick v5.9: W8–W11 Bridge weeks + inline nav + upper body W8–W10 |
| pending | Shaylan v3.3: W11 off-week + W12 return-to-form + W13 Sacramento |
| pending | Patrick v5.8: W1–W4 Tue/Thu → VO2 max 4×4 structure |
| 0e0f850 | Restore from upload conflict · Patrick v5.7 + Yari v2.4 + Dashboard sbFetch fix |
| 6ca4a13 | Patrick v5.7: 6 missing EX_INFO entries |
| cbacfd2 | Scheduled task: multi-planar blocks · Patrick Fri=recovery/Sat=gym · 4×4 VO2 max canal |

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
- [ ] LOW: CSV export confirmation prompt before download
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

#### Spinal Rehab (Patrick)
- **Foraminal stenosis — decompression loading specificity**: What direction and load magnitude optimally opens the L4-L5 foramen? Backward sled vs. backward treadmill vs. aquatic — comparative decompression studies limited. Worth tracking as Patrick transitions modes.
- **ESI vs. radiofrequency ablation outcomes**: Comparative RCT data for foraminal stenosis specifically (vs. central stenosis, which is better studied). Cochrane reviews updated 2023–2024.
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

#### Sprint / Jump (Shaylan, Cadence)
- **Shin splints (MTSS) — bone stress vs. muscle model**: The tib post tension model (currently guiding our tib post iso work) vs. the tibial bone bending model. Recent imaging studies (MRI bone stress markers) may update loading prescription. Barrie & Meeuwisse 2019 worth reviewing.
- **Tibial bone stress capacity building**: Progressive impact loading protocols for MTSS prevention — what's the minimum effective stimulus? Fredericson's grading and return-to-run protocols.
- **Penultimate step mechanics** (Shaylan LJ): Schexnayder's work on COM lowering strategy. Any recent 3D kinematics data on optimal penultimate step length-to-height ratio?
- **Plantar fascia loading protocols** (Cadence): Rathleff et al. high-load strength training (single-leg heel raise with towel curl) — already partly applied. Baar collagen timing for PF specifically — less studied than Achilles.
- **Nordic hamstring curl — hamstring strain prevention in sprinters**: Any evidence specific to LJ/sprint athletes vs. soccer? Dose and timing relative to competition.

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

---

## App Roadmap — Patrick as Primary User

As Shaylan moves to Berkeley, Yari to Mexico, and Cadence's situation TBD, Patrick becomes the primary active user. These are the next development directions in rough priority:

### Expert pool — candidates to vet
- **P3 Applied Sport Science (Marcus Elliott)** — biomechanics profiling, asymmetry management, force plate / RSI data. Patrick wants to add as a reference. *Pending: review Gemini chat Patrick will provide.*
- **Conor Harris** — glute med fiber-specific programming. Already applied in Yari W5–W9. Add to expert table.
- Others TBD as research pipeline develops.

### Velocity Based Training (VBT)
- Potential integration for Patrick's autoregulation. Bar velocity correlates to readiness — a velocity drop on a warm-up set tells you to back off before loading up. Especially useful with spinal rehab where some days are not what they look like subjectively.
- Smartphone-based options (Metric, My Lift) are accessible and free/cheap.
- Key researchers: Bryan Mann, Gonzalez-Badillo, Daniel Baker.
- Implementation: could add a "Today's readiness" VBT check-in at session start in Patrick's guide.

### Video demos — curated over generic
- Current approach: YouTube `?search_query=` links → generic, inconsistent quality.
- Better: Patrick maintains a list of specific video IDs (unlisted or public YT) per exercise. App stores them and links directly.
- Feature: per-exercise "save my preferred demo" — stores a YouTube URL in localStorage; falls back to search link if none saved.
- Patrick already has private YouTube playlists with preferred demos — need to make these unlisted (not private) for embedding.

### Day-of exercise customization
- Feature request: add or remove exercises on a given day without permanently altering the program.
- Implementation: localStorage-based daily overrides keyed by `[weekIdx]-[dayIdx]`. Resets to base program next day.
- UI: small +/– buttons per exercise, plus an "Add exercise" field at the bottom of each block.

### Hard data integration (P3-style)
- Currently tracking: pain scores, gate checks, subjective ratings.
- Missing: performance metrics — RSI (reactive strength index), hop test LSI, force asymmetry, velocity data.
- A simple manual entry screen for key metrics at gate assessments would significantly upgrade the clinical value of the system.
- Patrick's motto: *"Do what I can with what I have in the moment."* The system should reflect that — data informing decisions, not replacing them.