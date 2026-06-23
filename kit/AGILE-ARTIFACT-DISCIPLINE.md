# Agile Artifact Discipline

> Portable reference derived from Scott Ambler's [Agile Modeling](https://agilemodeling.com/) and [Agile Data](https://agiledata.org/) work (Ambysoft). Judgment aids for **what to produce, for whom, when, and when to stop** — not a documentation methodology.

Part of the zanshin-pi-extension kit. For code-specific principles see `ENGINEERING-PRINCIPLES.md`. For framing and assumptions see `skills/shoshin/SKILL.md`.

---

## Why this exists

Models and documents are expensive to maintain. Every artifact you keep must be updated when things change. Agile Modeling treats documentation as a **means** — communication that enables a decision — not an end.

AI inverts the economics: artifact production is nearly free, so assistants over-produce fluent, comprehensive output with no reader and no decision attached. This document encodes Ambler's counterweights.

---

## Core concepts

### JBGE — Just Barely Good Enough

An artifact is **sufficient for the task at hand, and no more**. Past JBGE, extra effort is waste unless context demands it.

**Invest more effort when:**

- Complexity (problem or solution) is high
- Risk is high (often correlated with complexity)
- Regulatory compliance requires it — interpreted **pragmatically**, not bureaucratically
- Artifact culture demands it for good reason (not fear-driven "we might need this someday")

**Invest less effort when:**

- The audience is skilled and experienced
- The artifact is easy to change later
- Stakeholders are accessible — you can fill gaps collaboratively
- Communication is high-bandwidth (pairing, short feedback loops)
- The subject is likely to change soon

Sources: [JBGE core practice](https://agilemodeling.com/essays/barelygoodenough.htm), [When is it JBGE?](https://agilemodeling.com/essays/barelygoodenoughwhen.htm)

**Update only when it hurts:** If an artifact is *more* than good enough but not harming other work, don't polish it. Busy work on diagrams nobody uses decreases value.

### TAGRI — They Ain't Gonna Read It

Documentation that the intended audience will not read is waste — and a signal that something is wrong with the communication approach.

Before creating or expanding an artifact, name:

1. **Who reads it?** (Specific role or person — not "the team")
2. **What decision or action does it enable?** (If none, don't write it)

Source: [Agile architecture — travel light](https://agilemodeling.com/essays/agilearchitecture.htm)

### Model with a purpose

Do not model or document without knowing **audience** and **purpose**. Multiple models are fine; purposeless ones are not.

Corollary: **content over representation** — a whiteboard sketch that communicates beats a polished diagram nobody uses.

Source: [AM principles](https://agilemodeling.com/principles.htm)

### Travel light

Every kept artifact must be maintained across change. Prefer:

- Fewer artifacts
- Lighter artifacts (sketch before diagram, diagram before document)
- Discarding models once they've served their purpose

Err on the side of **not enough** — you can always add. Time spent on unneeded detail is gone forever.

### Document late, envision early (AMDD sketch)

| Phase | Activity | Anti-pattern |
|---|---|---|
| **Envision** | Minutes: constraints, options, open questions | Multi-page architecture doc upfront |
| **Explore** | JIT model storming, spikes, conversations | Full spec before code |
| **Implement** | Working software / committed truth | Polishing prose instead |
| **Stabilize** | JBGE docs, tests, craft review | Re-documenting everything |
| **Release** | What proved true, for the next reader | Artifact for its own sake |

Source: [AM core practices](https://agilemodeling.com/essays/bestpractices.htm)

### Active stakeholder participation

Stakeholders provide timely decisions and information. In AI-assisted work, **the human is the stakeholder** — ask before inferring on load-bearing assumptions; pause for answers.

Maps to shoshin collaborative mode and feedback checkpoints.

### Humility (AM value)

Assume others — including the user — have expertise you lack. Treat their input as at least as valuable as your synthesis. Maps to shoshin.

---

## How to use these (not a checklist)

These are **lenses**. Apply the one that illuminates the problem. When lenses conflict (JBGE vs "make it comprehensive for compliance"), the conflict is the signal — resolve with context, not defaults.

**Ambient posture:** JBGE default; TAGRI before expanding docs; travel light; document what proved true.

**Invoked depth:** Run `skills/craft/SKILL.md` with the JBGE lens on a draft, or `skills/shoshin/SKILL.md` for audience/purpose before a large artifact.

---

## AI-specific failure modes

| Failure mode | Lens |
|---|---|
| Comprehensive epic nobody owns | TAGRI + model with a purpose |
| README/handoff sprawl | Travel light + JBGE |
| Spec before spike | Document late, envision early |
| Polished wrong frame | Shoshin before expanding |
| Enterprise template fill | JBGE + YAGNI (see ENGINEERING-PRINCIPLES) |
| "Looks done" prose | Spar on claims; craft on structure |

---

## Related

- `ENGINEERING-PRINCIPLES.md` — code and design (DRY, KISS, SRP, phases)
- `skills/shoshin/SKILL.md` — framing and assumptions
- `skills/craft/SKILL.md` — invoked review including JBGE lens
- `WORKING-STYLE.md` — session practices and AMDD bracket

**External:** [agilemodeling.com](https://agilemodeling.com/) · [agiledata.org](https://agiledata.org/) · Scott Ambler's essays on JBGE, TAGRI, and agile architecture
