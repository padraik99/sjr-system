# Patrick Guide — Console + Log Redesign · Build Spec
*Locked Jul 3 2026. Decisions from the design session (hybrid concept approved). Build target: `SJR_WeeklyGuide_Patrick_v5_20260402.html`. Previews: `guide-console-hybrid-preview-20260703.html`.*

## Design direction — HYBRID (approved)
Concept A's card + verdict framing, Concept B's list-row logging + lowercase-mono section headers. One "today" console replaces the current five stacked surfaces (wave headline + gate banner + VBT panel + flareup panel + the separate rehab spreadsheet).

## Console (top of guide)
- **Eyebrow**: `wave · build N of 3` + date.
- **Verdict**: color-spined block, serif headline (Playfair) + one-line "why" (governor output). Downregulate-only, unchanged logic.
- **Log actions** (B-style list rows, big tap targets): Log pain · Log an issue · Performance data.
- **Status chips**: lift readiness % (renamed from "Session Readiness" — it's the barbell/VBT check), flare day #, gate reference (now /10).
- Flareup panel collapses to the `flare day N` chip. VBT panel folds into `lift readiness` chip + its own expand.

## Contrast fix — ✅ APPLIED Jul 3
`--muted` #8a8680 → **#b0aca2**, `--dim` #5a5855 → **#8a8680**. Readable in daylight; hierarchy preserved. (Every label in the app benefits.)

## Unified log modal — grouped, progressive disclosure, 0–10 with 0.5 decimals
Quick daily pain = 2 taps; deeper rehab/treatment one tap further in.

- **Pain** (opens by default): **Back · Nerve · Glute** — 0–10 half-point sliders.
  - Nerve = radicular umbrella (calf / ankle / lateral / tingling *sensation*). **Standalone "Ankle" metric retired** (Patrick: ankle/calf/nerve synonymous now). Historical `ankle` rows kept in DB; no new input.
- **Symptoms**: **Leg-vs-back direction** (back-dominant · equal · leg-dominant) — absorbs both the sheet's "leg vs back dominant" and "centralization" (same axis); **Toe Tingle** (Y/N, discrete L5 marker — stays a toggle, not a slider); **AM Dizzy** (No/Some/Yes toggle).
- **Sleep**: Overnight pain (0–10); **Night wakings** (# — new); Wake time(s) (text, existing `pt_wake_times`).
- **Treatment** (modality-agnostic): modality selector **NexWave · Shockwave · +** → before/after 0–10 → auto-delta. **Medrol day #** auto-derived from taper dates (7/3–7/8), self-expires after 7/8.
- **Notes**: Exercise-done toggle; one free-text field merging "leg symptom detail" + "notes."

## Demo links
Keep the `pt_demos` flow (＋ demo → prompt → save unlisted YouTube link → ▶ demo, http(s)-validated, ✎ change, 🔍 search fallback). **Extend the ＋ demo affordance to rehab / flare-protocol movement rows**, not just strength lifts.

## Export / summary (new — was the spreadsheet's whole purpose)
In-app doc-facing view recreating the xlsx Summary tab: averages (morning/overnight pain, per region), symptom-direction trend, treatment before/after deltas, toe-tingle Y-day count, dizzy Y/S counts, wakings, date range. Printable/shareable to bring to **Bansal (7/8)** and **Kataria (7/28)**. Keeps sensitive data off a loose xlsx → private Supabase sync (honors the earlier "no health data in a downloadable file" call).

## Storage (no schema change)
`pain_logs` stays `{athlete_id, date, metric, score, timing}`. New numeric fields = new `metric` values (`wakings`, `nexwave_before`, `nexwave_after`, `shockwave_before/after`, `leg_dominant` coded 0/1/2). Text fields (notes, wake times, leg detail, exercise-done) ride in date-keyed localStorage (`pt_*` pattern, 35-day prune) like `pt_wake_times` already does.

## Scale conversion — Patrick runs in Supabase SQL editor (scoped!)
```sql
UPDATE pain_logs SET score = GREATEST(0, score*2 - 0.5)
WHERE metric IN ('morning','nerve','glute','ankle','overnight');
```
Pain metrics only. **Excludes `tingle` (Y/N = 0/1) and `dizzy` (No/Some/Yes = 0/1/2)** — a blanket update corrupts those. Run at go-live.

## Build order (staged, verify each step host-side)
1. ✅ Contrast fix.
2. Log modal rebuild — regions (drop Ankle), 0–10 sliders, the five groups; rewire `selectMetric`/`selectScore`/`saveLog` + `METRIC_LABELS`/`METRICS_NO_TIMING`; keep Supabase save path.
3. Console swap — replace wave-headline + gate-banner + VBT + flareup markup with the hybrid console; keep every JS-updated element ID (`renderWaveHeadline`, gate render, VBT render, flareup render) wired.
4. Export/summary view.
5. Conversion SQL + full browser smoke test.

## Watch-outs
One `<script>` open/close only; `node --check` the extracted script host-side before finishing (mount is stale — don't trust bash reads of the file). GitHub Desktop overwrite in place (no delete-then-add). Repo HTML already has v6.0.4 (Overnight/Toe/Dizzy/wake) — that's the correct base.
