# Martial vocabulary — seeds for later

> Status: **food for thought**, not active kit practice.  
> Date: 2026-10-05  
> Do not add slash skills from this file without a real repeated gap.

Names already in the kit (shoshin, zanshin, spar, kaeshi, yomi) came from practices that needed a sharp verb. New dojo words should pass the same test: **does this name a gap plain language / existing skills don’t already cover?**

Related active docs: `WORKING-STYLE.md`, `AGILE-ARTIFACT-DISCIPLINE.md` (JBGE / travel light), `skills/kaeshi`, `skills/yomi`.

---

## Already covered — don’t rename

| Need | Where it lives |
|------|----------------|
| Reset the frame | `/shoshin` |
| Stay aware after the cut | zanshin (ambient / kit name) |
| Pressure-test a proposal | `/spar` |
| Failure rails / anti-goals | `/kaeshi` |
| Consequence chains | `/yomi` |
| Ship thin / don’t overbuild | craft + JBGE + YAGNI + work→right→fast |
| Recover mid-flight | `/checkpoint`, `/whats-next` |

---

## Shu-ha-ri (守破離) — learn → break → leave

**Sense:** Three stages of mastery with a form (kata, convention, kit):

1. **Shu (守)** — protect / obey. Follow the form exactly. Copy the spar structure, the checkpoint format, the branching defaults. Don’t improvise yet.
2. **Ha (破)** — break / detach. Once the form is in the body, bend it for the situation. Skip a spar field. Checkpoint in three lines. Drop a skill that doesn’t fit this customer’s harness.
3. **Ri (離)** — leave / transcend. The form is internalized; you act without clinging to the checklist. The kit becomes optional scaffolding, not identity.

**Why it fits this kit:** Zanshin’s own arc is travel light — encode discipline, then don’t worship the encoding. Shu-ha-ri is a name for *when* to stop cargo-culting WORKING-STYLE or a skill’s XML. It also describes how consumers should adopt the kit: copy first, adapt second, outgrow third.

**Possible shapes later (pick at most one if promoted):**

- A short section in `WORKING-STYLE.md` under “how to use this kit over time”
- An essay in the consumer workspace (Field Notes philosophy track) — not necessarily a skill
- A one-liner in skill footers: “Shu: follow this process. Ha: bend when the situation is clearer than the template. Ri: you don’t need the skill if the stance is already loaded.”

**Not a slash skill by default.** Invoking `/shu-ha-ri` is meta-cosplay. The value is a shared maturity language when someone asks “are we over-following the kit?”

**Tension to name if written up:** Ri can become an excuse to skip verification or spar. True ri still hits the failure modes (fluent-but-wrong, context reset) — it just doesn’t need the ceremony.

---

## Heijōshin (平常心) — everyday mind under pressure

**Sense:** Calm, ordinary mind in extraordinary conditions. Not numbness — clarity without panic, ego, or performance for the audience.

**Why it might earn a place:** Ops and incidents, often with the **customer on the line**. The failure modes shift:

- Fluent-but-wrong becomes dangerous in real time (confident wrong RCA on a bridge call)
- Over-sparring / over-kaeshi burns the window while the cluster is down
- Sycophancy or heroics for the customer audience distorts the work
- Context compaction mid-incident loses the last verified fact

**Sketch of a posture (not yet a skill):**

| Move | Heijōshin version |
|------|-------------------|
| Speak | Only what you’ve verified; label hypotheses as hypotheses |
| Pace | Slow enough to check; fast enough to matter — no performative urgency |
| Audience | Customer hears status and next action; debug detail stays in the channel that can hold it |
| Tools | One change at a time; say what you will do before you do it |
| Ego | No “I know what this is” until evidence; no silence that hides uncertainty |
| After | Short incident note while memory is fresh (bookkeeping), not a postmortem novel on the call |

**Relation to existing practices:**

- **Verification** — heijōshin is verification under social/time pressure
- **Shoshin** — still ask if the frame is wrong (“are we sure this is DNS?”) but don’t hold a workshop on the bridge
- **Yomi** — one step of “and then what?” before a risky fix; not a full chain essay
- **Mushin** — adjacent but different: mushin is unattached execution; heijōshin is steady ordinary mind. On a customer call you want heijōshin first; mushin without verification is recklessness

**Possible shapes later:**

- Ambient paragraph in consumer `AGENTS.md` for ops-heavy workspaces
- Invoked `/heijoshin` or “apply heijoshin” for bridge-call mode — only if natural language + verification keep failing in practice
- Pair with **ukemi** (below): calm mind + designed cheap fall

---

## Ukemi (受身) — breakfall

**Sense:** Receive the throw without injury. In the dojo you practice falling so that failing an attempt doesn’t end the session. The skill isn’t “never get thrown” — it’s “land so you can stand up.”

**Why it might earn a place:** Labs, rollouts, and incident fixes are full of *attempts* that may fail. Kaeshi asks what would ruin the *goal*; yomi asks what ripples an *action* creates; ukemi asks **how this attempt fails safely** if you’re wrong.

| Lens | Question | Time |
|------|----------|------|
| **kaeshi** | What guarantees we miss the goal? | Before the plan hardens |
| **yomi** | And then what if we do X? | Before / while choosing X |
| **ukemi** | If this attempt is wrong, how do we land? | Before executing a risky step |
| **heijōshin** | Stay ordinary-minded while landing | During the call / change window |

**Sketch of a posture (not yet a skill):**

Before a risky change (prod patch, one-way migration, “just restart it,” customer-visible toggle):

1. **Name the fall** — what’s the failure mode of *this attempt* (not the whole project)?
2. **Name the mat** — rollback, previous ReplicaSet, backup, feature flag off, freeze further changes, known-good config path
3. **Name the signal** — how will you know you’re on the ground in time (symptom, metric, customer report)?
4. **Name the get-up** — first action after the fall (revert command, scale back, page who)
5. **Refuse unpadded throws** — if there’s no mat, don’t take the fall in prod; take it in lab or don’t throw

**Lab / journal angle:** A trial log entry that only records “what we tried” without “how we would undo it” is training without ukemi. Cheap falls belong in the same note as the procedure.

**Incident angle (with heijōshin):** On a bridge call, ukemi is the one-line revert plan spoken *before* the speculative fix — so calm mind has a place to land if the fix is wrong.

**Relation to existing practices:**

- **Kaeshi** — anti-goals for the destination; ukemi is padding for the next move
- **Yomi** — may *surface* a bad landing (“and then the CRD is stuck”); ukemi *designs* the landing
- **Verification** — “how would I know this is wrong?” pairs with “what do I do when I know?”
- **Branching / progressive bookkeeping** — commits and checkpoints are soft mats for agent work; ukemi for cluster work needs an operational mat

**Possible shapes later:**

- Pre-flight checklist paragraph in ops guides or incident AGENTS ambient
- Invoked `/ukemi` or “ukemi this change” before risky apply — only if people keep skipping rollback design
- Field Notes lab convention: every trial notes undo path (habit) before any skill

**Tension:** Ukemi can become delay theater (“we can’t act until the perfect rollback”). Good ukemi is usually one or two concrete lines, not a DR binder. If the mat can’t be stated briefly, the throw may be too big — split the attempt (shu / thin slice), don’t write a novel.

---

## Other seeds (lighter)

### Maai — distance / timing

When to close distance (spar, dig, patch) vs stay out. Antidote to over-sparring and over-tooling on every idea. Likely a WORKING-STYLE paragraph, not a skill.

### Kata ↔ randori

Fixed form vs free practice. Templates and skills are kata; exploratory debugging is randori. Useful vocabulary when someone applies a full skill ritual to a two-line question (or free-wheels with no form when the form would have caught a miss).

### Mushin — no-mind

Unattached execution. Mapping to POC/MVP is a stretch — JBGE / YAGNI / “make it work” already own thin delivery. Keep as optional prose metaphor; **do not** add `/mushin` unless anti-rumination keeps failing after those exist. Easy to confuse with shoshin/zanshin/heijōshin.

---

## Promotion checklist

Before anything here becomes a skill or WORKING-STYLE section:

1. Name the **repeated gap** in real sessions (not aesthetic fit)
2. Say why an existing practice doesn’t cover it
3. Prefer a short ambient paragraph over a new slash skill
4. Prefer consumer-workspace essay over kit bloat when the idea is philosophical
5. Re-read this file’s “already covered” table

---

## Open threads

- Shu-ha-ri: write as kit adoption guidance, or Field Notes essay first?
- Heijōshin: try as a one-session experiment on a real bridge call (ambient instructions only) before designing a skill
- Ukemi: try “name the mat” aloud before one real risky change or lab trial; overlap-test against kaeshi/yomi — promote only if the five-line pre-flight keeps getting skipped
