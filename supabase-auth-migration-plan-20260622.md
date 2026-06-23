# Supabase Security — Lockdown + Shared-Login Migration Plan
*Created Jun 22 2026 · triggered by Supabase security alert (rls_disabled_in_public on `subjects`; always-true write policy on `pain_logs`).*

## Decision
Move from **no-auth (anon key, public reads)** → **single shared login**. One credential gates the whole database; the public key grants nothing without a valid session. Keeps coach-sees-all (no per-user isolation — deliberately not building that; roster is dispersing toward a single user). Athlete rows stay keyed by `athlete_id` string exactly as now — no data-model rewrite.

## The core architectural truth
The app has no login, so there's no `auth.uid()` to bind RLS to → "policy always true" is unavoidable in the current design, and **reads are open to anyone with the publishable key (which is in the public repo + page source).** Shared login closes the public-read hole; it's the real fix. Per-user isolation buys ~nothing here (coach sees all anyway).

---

## STEP 0 — Immediate lockdown (do TODAY, independent of the auth build)
Run in Supabase SQL editor. Safe, no data loss, no app breakage (matches what the code actually does: pain/injury = insert+read only; athlete_state = upsert; assessment_logs = +delete).

**Exact policy names confirmed from `pg_policies` (Jun 22):** pain_logs `athlete can manage own pain logs` (ALL, with_check=true — the flagged one); injury_logs `athlete can manage own injury logs` (ALL, athlete_id allowlist); athlete_state `athlete can manage own state` (ALL, allowlist); assessment_logs `athlete_ids_only` (ALL) + `allow_delete` (DELETE). The allowlists are dropped → `true` deliberately (not real security; the auth flip is). RLS already enabled on all four log tables (they have active policies); only `subjects` needs enabling.

**Idempotent version** (Postgres `CREATE POLICY` has no `IF NOT EXISTS`, so a re-run on a partially-applied state errors with "policy already exists" — drop the NEW names too before creating, so it converges from any state):
```sql
-- CRITICAL: lock the stray StudyLab table (no data loss; enabling when already on is a no-op)
alter table public.subjects enable row level security;
-- then, once you confirm StudyLab's real copy lives in ITS own project:  drop table public.subjects;

-- pain_logs (was always-true ALL) -> insert + read only
drop policy if exists "athlete can manage own pain logs" on public.pain_logs;
drop policy if exists "anon_insert_pain" on public.pain_logs;
drop policy if exists "anon_select_pain" on public.pain_logs;
create policy "anon_insert_pain" on public.pain_logs for insert to anon with check (true);
create policy "anon_select_pain" on public.pain_logs for select to anon using (true);

-- injury_logs (was allowlist ALL) -> insert + read only
drop policy if exists "athlete can manage own injury logs" on public.injury_logs;
drop policy if exists "anon_insert_injury" on public.injury_logs;
drop policy if exists "anon_select_injury" on public.injury_logs;
create policy "anon_insert_injury" on public.injury_logs for insert to anon with check (true);
create policy "anon_select_injury" on public.injury_logs for select to anon using (true);

-- athlete_state (was allowlist ALL) -> insert + update (upsert) + read; no delete
drop policy if exists "athlete can manage own state" on public.athlete_state;
drop policy if exists "anon_insert_state" on public.athlete_state;
drop policy if exists "anon_update_state" on public.athlete_state;
drop policy if exists "anon_select_state" on public.athlete_state;
create policy "anon_insert_state" on public.athlete_state for insert to anon with check (true);
create policy "anon_update_state" on public.athlete_state for update to anon using (true) with check (true);
create policy "anon_select_state" on public.athlete_state for select to anon using (true);

-- assessment_logs (was athlete_ids_only ALL + allow_delete) -> insert + read + delete
drop policy if exists "athlete_ids_only" on public.assessment_logs;
drop policy if exists "allow_delete" on public.assessment_logs;
drop policy if exists "anon_insert_assess" on public.assessment_logs;
drop policy if exists "anon_select_assess" on public.assessment_logs;
drop policy if exists "anon_delete_assess" on public.assessment_logs;
create policy "anon_insert_assess" on public.assessment_logs for insert to anon with check (true);
create policy "anon_select_assess" on public.assessment_logs for select to anon using (true);
create policy "anon_delete_assess" on public.assessment_logs for delete to anon using (true);
```
After Step 0: destructive surface gone on the log tables, foreign table closed. INSERT policies will still lint as "always true" (unavoidable pre-auth). Reads still open — that's what the auth migration fixes. **Test one log entry from a guide after applying** (if it fails, it's a `to anon` role mismatch — easy fix). Re-run the diagnostic query to confirm.

---

## The migration (order matters — flip policies LAST so you don't lock yourself out)

### STEP 1 — Dashboard (Patrick)
1. **Authentication → Providers → Email:** enable. 
2. **Create exactly one user** (Authentication → Users → Add user): an email you control + a strong password. This is the shared credential.
3. **Authentication → Sign In / Providers → disable "Allow new users to sign up."** Critical — otherwise anyone can self-register and become `authenticated`, defeating the point.
4. Do NOT flip policies yet.

### STEP 2 — Code: shared auth gate (Claude) — PILOT on Patrick's guide first
Build a small, reusable login layer (zero-dependency, raw REST — in keeping with the no-library standard):
- **Login:** `POST {url}/auth/v1/token?grant_type=password` with header `apikey: <publishable key>`, body `{email, password}` → returns `access_token` + `refresh_token`.
- **Store** both in localStorage (`sjr_session`). On load, if present and unexpired → proceed; else show a minimal password overlay.
- **`sbFetch` change:** add `Authorization: Bearer <access_token>` alongside the existing `apikey` header. (Publishable key stays in `apikey` only — the existing CLAUDE.md rule holds; the Bearer now carries the *user JWT*, which is correct.)
- **Refresh (MUST-HAVE, not optional):** Shay (Berkeley) + Yari (Mexico) confirmed they want to keep using the guide, so login friction has to be near-zero — **one password, typed once per device, then a sticky session.** Persist the refresh token, renew silently in the background and on any 401; only fall back to the login overlay if the refresh itself fails. They should essentially never see the prompt twice on the same device.
- **Gate scope:** the overlay blocks DB actions, not the program content — a logged-out guide still shows the plan; only logging/sync requires login. Graceful.
- **Exempt:** Shaylan's offline boot-guide build reads nothing from Supabase — no login, leave it alone.

Pilot validation on `SJR_WeeklyGuide_Patrick_v5_20260402.html` against the *current* `to anon` policies: confirm login works, logging writes, history reads, token refresh survives an hour. Only then replicate.

### STEP 3 — Code: roll out to remaining DB-touching files
`shaylan_weekly_v3`, `Cadence_Weekly_v3`, `SJR_Yari_Guide_v2`, `SJR_Yari_Assessment_v1`, `SJR_Dashboard_v1`. Same gate + sbFetch change. (Static/no-DB files need nothing.)

### STEP 4 — Flip policies to authenticated (LAST, after login code is live + tested)
Re-run the Step 0 policies but `to authenticated` instead of `to anon`. After this, the publishable key alone does nothing — public access is dead.
```sql
-- example for one table; repeat the Step 0 set with `to authenticated`
drop policy if exists "anon_select_pain" on public.pain_logs;
create policy "auth_select_pain" on public.pain_logs for select to authenticated using (true);
-- ...etc for every table/op from Step 0
```
Re-test the full loop. Done.

---

## Gotchas
- **Sequence:** policies flip to `authenticated` only AFTER login ships and is tested, or the app breaks for everyone (including you) in the gap.
- **The password is a real secret** — never commit it, never put it in the HTML. The email can live in code; the password is typed at login only.
- **Disable signups** or the whole thing is moot.
- **Token refresh** is the one fiddly bit of raw-REST auth; budget for it. (supabase-js would handle it automatically but adds a dependency — chose raw to honor the zero-dep standard. Revisit if refresh gets painful.)
- **Long-term question (parked):** as the system collapses toward just-Patrick on one device, weigh whether cloud sync is worth keeping at all vs local-first + cloud only for the dashboard. Smaller attack surface, fewer moving parts.
