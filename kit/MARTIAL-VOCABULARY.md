# Martial vocabulary

> Date: 2026-10-05  
> Map of dojo-related names in (or near) the kit — **active**, **lightly promoted**, and **seeds**.  
> New slash skills still need a real repeated gap (see promotion checklist).

Related: `WORKING-STYLE.md`, `AGILE-ARTIFACT-DISCIPLINE.md`, `skills/*`.

---

## At a glance

| Term | Sense (kit gloss) | Status |
|------|-------------------|--------|
| **zanshin** (残心) | Remaining mind — awareness after the cut; the kit’s namesake posture | Active (ambient / brand) |
| **shoshin** (初心) | Beginner’s mind — reset framing before building | Active (`/shoshin`) |
| **spar** | Adversarial pressure-test (≈ **kumite** 組手 — engaging hands) | Active (`/spar`) — **keep English name** |
| **kaeshi** (返し) | Reversal — what guarantees failure? | Active (`/kaeshi`) |
| **yomi** (読み) | Reading ahead — and then what? | Active (`/yomi`) |
| **shu-ha-ri** (守破離) | Follow → break → leave the form | Light (WORKING-STYLE section) |
| **heijōshin** (平常心) | Everyday mind under pressure | Light (Field Notes AGENTS ambient) |
| **ukemi** (受身) | Breakfall — cheap landing if the attempt is wrong | Light (Field Notes AGENTS ambient) |
| **kihon** (基本) | Basics — fixed forms (shell, edit anchors, …) | Active (`/kihon`, `kit/kihon/`) |
| **fudōshin** (不動心) | Immovable mind — judgment unmoved by pressure/fluency | Seed |
| **maai** (間合い) | Distance / timing of engagement | Seed |
| **kata / randori** | Fixed form vs free practice | Seed |
| **mushin** (無心) | No-mind — unattached execution | Seed (do not force onto MVP) |

**Ordering (decision work):** shoshin → kaeshi / yomi → spar.  
**Ops overlay:** heijōshin + ukemi on the bridge or before a risky apply.  
**Adoption arc:** shu-ha-ri over months with the kit itself.

---

## Active in the kit

### Zanshin (残心) — remaining mind

Awareness that continues after the technique: don’t drop attention when the commit lands or the session ends. Names the whole kit. Lives as ambient posture and package identity, not a slash skill — progressive bookkeeping, verification, and “re-read before deciding” are how it shows up in practice.

### Shoshin (初心) — beginner’s mind

Empty the cup. Surface load-bearing assumptions against source artifacts before building on a wrong frame. Curious, not adversarial.

- **Skill:** `skills/shoshin/SKILL.md` · `/shoshin`
- **When:** Plan feels settled, scope drifted, or “obvious” premises haven’t been checked
- **Not:** TAGRI/JBGE doc hygiene (that’s craft / artifact discipline); not spar

### Spar — adversarial review

Steel-man objections against a written thesis, design, or plan. Attack strongest claims; self-audit for pattern-matching devil’s advocate.

- **Skill:** `skills/spar/SKILL.md` · `/spar`
- **When:** A proposal exists and needs pressure before you commit
- **Not:** Framing reset (shoshin); failure rails (kaeshi); consequence chains (yomi)

**Kumite note:** In Japanese martial arts, **kumite** (組手) is sparring — engaging hands with a partner under pressure. That is the same job as `/spar`. We keep the English name: “spar” is already martial, and it is load-bearing in consumer essays and case studies. Say kumite when the gloss helps; invoke `/spar` in the kit.

### Kaeshi (返し) — reversal

Invert the goal: what would guarantee failure? Build anti-goals and avoidance rails.

- **Skill:** `skills/kaeshi/SKILL.md` · `/kaeshi`
- **When:** Goal clear; plan/constraints not
- **Not:** Attacking a written proposal (spar); tracing “and then what?” (yomi)

### Yomi (読み) — reading ahead

Second-order thinking: and then what? Follow consequence chains until the go/no-go changes.

- **Skill:** `skills/yomi/SKILL.md` · `/yomi`
- **When:** Action/choice clear; downstream effects not
- **Not:** Anti-goals for a naked goal (kaeshi); steel-man critique (spar)

### Kihon (基本) — basics

Fixed forms you drill until automatic — execute the form, don’t debate it. Distinct from **craft** (judgment lenses / tradeoffs).

- **Skill:** `skills/kihon/SKILL.md` · `/kihon <domain>`
- **Docs:** `kit/kihon/` — axes (shell, secrets, vault, sql, git, k8s-change, testing, lint, structured-edit) and thin verticals (ansible, helm, kustomize, python, typescript)
- **When:** Stack or hygiene basics before/during implementation
- **Not:** Product deep-dives (consumer `devops/`); DRY/KISS tradeoffs (craft); framing (shoshin)

`/craft` auto-loads a subset (shell, secrets/vault hints, edit anchors, light test/lint).

### Also covered without dojo names

| Need | Where |
|------|--------|
| Ship thin / don’t overbuild | craft + JBGE + YAGNI + work→right→fast |
| Recover mid-flight | `/checkpoint`, `/whats-next` |
| Writing defaults | `STYLE.md` |

Don’t invent martial names for these unless a gap appears that plain language can’t hold.

---

## Lightly promoted (ambient / docs — not skills)

### Shu-ha-ri (守破離) — learn → break → leave

1. **Shu (守)** — follow the form (spar structure, checkpoint format, skill processes).
2. **Ha (破)** — bend when the situation is clearer than the template.
3. **Ri (離)** — act from the stance without clinging to the checklist — without dropping verification or treating fluency as evidence.

**Where:** `WORKING-STYLE.md` → “How to use this kit over time (shu-ha-ri)”.  
**Not a slash skill.** `/shu-ha-ri` would be meta-cosplay. Use the language when asking “are we cargo-culting the kit?”  
**Tension:** Fake ri skips spar/verification; real ri still hits the three failure modes.

### Heijōshin (平常心) — everyday mind under pressure

Calm ordinary mind in extraordinary conditions — clarity without panic, ego, or performance for the audience.

**Where it bites:** Ops/incidents with the **customer on the line**. Fluent-but-wrong and heroics get expensive.

| Move | Heijōshin version |
|------|-------------------|
| Speak | Verified only; label hypotheses |
| Pace | No performative urgency |
| Audience | Customer gets status + next action; debug elsewhere |
| Tools | One change at a time; say it before you do it |
| After | Short note while memory is fresh |

**Where:** Field Notes `AGENTS.md` (ops / incident posture). Try on a real bridge call before any `/heijoshin` skill.  
**Vs mushin:** Heijōshin is steady ordinary mind; mushin is unattached execution. On a customer call, heijōshin first — mushin without verification is recklessness.  
**Vs fudōshin:** Heijōshin is calm *tempo* and presence; fudōshin is unmoved *judgment* (see seeds).

### Ukemi (受身) — breakfall

Land so you can stand up. Not “never fail the attempt” — “fail this attempt safely.”

| Lens | Question |
|------|----------|
| kaeshi | What guarantees we miss the *goal*? |
| yomi | And then what if we do X? |
| **ukemi** | If *this attempt* is wrong, how do we land? |
| heijōshin | Stay ordinary-minded while landing |

**Pre-flight (keep it short):** name the fall, the mat (rollback/flag/backup), the signal you’re down, the get-up; refuse unpadded throws in prod.  
**Where:** Field Notes `AGENTS.md` (with heijōshin). Lab journals: undo path next to the procedure.  
**Tension:** Delay theater (“perfect DR first”) isn’t ukemi — one or two concrete lines, or split the throw.

---

## Seeds (not promoted)

### Fudōshin (不動心) — immovable mind

Unshakeable mind: not moved by fear, flattery, rank, panic, or fluent certainty — including the model’s. The stance holds until evidence moves it.

**Vs heijōshin:** Heijōshin is everyday calm under pressure (how you speak and pace on the bridge). Fudōshin is refusing to let social or rhetorical force change the call (“the VP is sure it’s DNS” / “the model stated it confidently” without a check).

**Kit tensions it names:**

- Sycophancy and audience-capture (customer or exec on the line)
- Fluent-but-wrong accepted because it sounded final
- Abandoning a verified RCA because a louder story arrived

**Relation to existing practices:** Verification and review discipline under social pressure; pairs with heijōshin on incidents (calm delivery + unmoved judgment). Not a replacement for shoshin (wrong frame) or spar (pressure-test a proposal).

**Possible later shape:** One ambient line next to heijōshin in ops AGENTS (“don’t move the call for fluency or rank — move it for evidence”). Skill only if bridge-call judgment keeps getting pushed around after that.

### Maai (間合い) — distance / timing

The space and timing of engagement: when to close (spar, dig, patch) vs stay out (watch, gather one more fact, let the incident breathe).

**Kit tension it names:** Over-sparring and over-tooling — closing distance on every idea. Under-engagement — never sparring a load-bearing plan.

**Possible later shape:** One paragraph under spar failure modes in WORKING-STYLE (“check maai”). Not a skill unless people keep mis-timing engagement after that.

### Kata ↔ randori — form vs free practice

- **Kata** — fixed form: skill XML, checkpoint template, branching defaults.
- **Randori** — free practice: exploratory debugging, messy incident channels, first contact with an unknown failure.

**Kit tension:** Full kata on a two-line question (shu stuck); pure randori with no form when a checklist would have caught a miss. Shu-ha-ri is the maturity arc across both. Useful teaching vocab; unlikely to need its own skill.

### Mushin (無心) — no-mind

Mind without clinging — spontaneous correct action without overthinking.

**Tempting misuse:** Renaming POC/MVP / “just ship it.” JBGE, YAGNI, and work→right→fast already own thin delivery.  
**Keep as prose metaphor only.** Do not add `/mushin` unless anti-rumination keeps failing after those exist. Easy to confuse with shoshin, zanshin, and heijōshin.

---

## Promotion checklist

Before a seed becomes a skill or grows beyond a short ambient note:

1. Name the **repeated gap** in real sessions (not aesthetic fit)
2. Say why an existing practice doesn’t cover it
3. Prefer a short ambient paragraph over a new slash skill
4. Prefer a consumer essay over kit bloat when the idea is philosophical
5. Re-read the active table — don’t rename spar; don’t duplicate shoshin/kaeshi/yomi

---

## Open threads

- Shu-ha-ri essay in a consumer philosophy track? Only if the WORKING-STYLE paragraph isn’t enough.
- Heijōshin / ukemi: after real uses — keep ambient, drop, or promote a skill.
- Fudōshin: try as a one-line add-on to ops ambient (“evidence moves the call, not rank or fluency”) only if heijōshin alone isn’t enough on bridge calls.
- Maai: promote to a WORKING-STYLE one-liner under spar only if over-sparring stays common.
- Mushin: leave parked.
