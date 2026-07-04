# Lag & Restraint — project seed
*A small interactive explainer on delayed feedback, overshoot, and why restraint is a form of intelligence. A standalone side project (not SJR), started Jul 3 2026 — Patrick + Claude.*

## The one idea
**When a system acts on information that arrives late, it overshoots.** Not because it's reckless — because by the time the signal shows up, the situation has already moved. The fix is almost never "try harder"; it's "respect the delay." Restraint, correctly understood, isn't timidity. It's the only sane response to a lagging signal.

## Why this one
It's the deepest pattern under the SJR governor — flares come from acting early on a body that reports late — but it's *everywhere*, and that universality is what makes it worth building as its own thing. If we get it right, it's the kind of piece someone bookmarks and sends to a friend.

## The worlds (same math, different clothes)
- **The scalding shower.** You turn the tap, nothing happens, you crank it more — then it scalds, so you overcorrect to freezing. The hot water was always coming; you just couldn't feel it yet. The cleanest, most visceral demo of feedback delay.
- **Training load.** Push on two good days; fatigue surfaces on day three; the flare lands on day four. (Your lived version — the honest, unglamorous example.)
- **The fishery / the lake.** Catch is great, so you scale the fleet; the stock was already collapsing, the data just hadn't caught up. Boom, then crash.
- **Attention & burnout.** Energy feels fine right up until it doesn't; the tank reads empty a week after it emptied.
- **(candidates for Patrick to pick):** thermostats, traffic waves, central-bank rate moves, watering a plant, a company hiring for last quarter's demand.

## The interactive (what we'd build)
One clean page. A single simulated system with two sliders:
- **Signal delay** (how late the feedback arrives)
- **Reaction strength** (how hard you respond to what you see)

Drag them and watch the same system move through three regimes: *smooth* → *oscillating* → *runaway boom-bust*. The insight lands physically: turning up reaction strength when the delay is long doesn't help — it's what breaks it. The way out is either shorten the lag (better/earlier signals) or soften the reaction (restraint). That's the governor's whole thesis, felt rather than told.

Likely a self-contained HTML canvas piece, dark and spare — the aesthetic we found in the guide work.

## Where I want your brain (this is a collaboration, not a delivery)
- Which worlds ring truest / which to cut. You've felt overshoot in your body; I've only read about it.
- The honest version of the training example — where the felt-signal actually lagged the real state, in your words.
- Whether the punchline should stay neutral-systemsy or get a little philosophical ("restraint is respect for what you can't yet see").
- Redline anything here. Half-formed is an invitation, per your own rules.

## The training timeline (Patrick's words, landed Jul 3 — the skin's script)
- **Fri May 29** — Indoor plyos w/ Yari, game-style (broad jump/cone shuttle, 15m full intensity). No warm-up ("not sweating, not primed"). 3/4 through: shooting pain lower-right back (the hip-flexion→knee-extension pattern). Cold sweats. Shut down own work, kept coaching. Then: 2–3 days ibuprofen+Tylenol → "hardly felt it again," running by day 3–4. **"Elated!"** Back still sore "the way it's always been sore." MBB shortly after: no result.
- **Wed Jun 10** — Indoor 1v1s, pressuring/chasing, lots of directional changes. Another shot through the back — **less sharp than May 29**, still a full stop. 4–5 days to light running (vs 3–4). Baseline soreness noticeably higher after. "Resolved to take it easy."
- **Thu Jun 18** — 4×4: struggled, 2 intervals to reach pace, never comfortable. Ignored — "running hadn't been an issue."
- **Fri Jun 19** — Outdoor, first-touch + shooting. Mostly just passing the ball, various speeds, occasional pressure. Back tightened during wind-down. **4am: full flare.**

### The three lag mechanisms in it (richer than the shower)
1. **Feel leads healing** *(corrected Jul 4 — Patrick did NOT train on painkillers; short course, stopped before returning)* — symptoms resolved in days on a genuinely honest sensor; tissue was on a much longer clock. The DOMS pattern-match ("felt better in a few days, like after a brutal workout") is the trap: muscle has short symptom tail + short tissue tail; a nerve root has short symptom tail + long tissue tail, and feel can't distinguish them. Quiet signal ≠ recovered system — the sensor reports symptoms, not state.
2. **Rising noise floor + falling threshold** — each hit felt *less* sharp but recovered *slower*; baseline soreness ratcheted up until the true warning was indistinguishable from everyday sore. Felt intensity falling while true damage rises — curves crossing in opposite directions.
3. **Integration lag** — the Jun 19 flare answered the 3-week integral, not the day's dose (the day's dose was passing drills). The body sums; the feel reports today's line item.

### Training-skin design decisions (from the timeline, Jul 3)
- **Not a re-skin of the shower.** Two mechanics the shower lacks: **hysteresis** (each flare lowers the capacity ceiling — boom-bust is a downward ratchet, not an oscillation) and **two recovery clocks** (felt trace recovers in days; tissue trace recovers on a longer clock — the gap between them IS the trap).
- **Ibuprofen button CUT/demoted (Jul 4):** Patrick didn't train medicated — the drug isn't needed for the trap, so centering it would be melodrama and misrepresent the facts. The sensor's native optimism digs the hole unaided. Less "cautionary tale about pills," more "your instruments report symptoms, not state."
- **Reveal beat (kept, now stronger):** run the sim showing only the felt trace; flare lands "out of nowhere"; then reveal the hidden tissue-state trace — it was never out of nowhere, and no bad decision was required. (= Jun 19, 4am.)

## Decisions log
- **Jul 3:** World #4 = **phantom traffic waves** (simulatable — our math wearing a highway). **Fed rate hikes = prose coda**, no sliders (simulating it would fake precision the Fed itself doesn't have — betrays the thesis). Five simulated worlds = too much; four skins + a coda = right size.
- **Jul 3:** Shower demo v1 built → `lag-and-restraint/index.html`. Controller finding: naive proportional control snaps straight from smooth to boom-bust — no hunting regime. Honest fix = human hand has a **max twist speed** (`dv/dt = R·tanh(error/4°)`); the saturation creates the bounded limit cycle. Regime grid verified in node: smooth/hunting/boom-bust as a clean diagonal band in (delay × reaction) space. More human = more honest math.

## Not the point
Not a productivity tool, not self-help, not SJR. A well-made small thing about a true idea. If it stops being fun, we shelve it — that's allowed.
