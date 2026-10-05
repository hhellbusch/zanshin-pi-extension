# Design philosophy — plan and borrowings

> Status: **plan + seeds**. CoC is the first promotion into craft.  
> Date: 2026-10-05  
> Do not import a whole framework doctrine as slash skills.

Related: `ENGINEERING-PRINCIPLES.md` (craft lenses), `MARTIAL-VOCABULARY.md` (omakase), `kihon/` (forms, not philosophy).

---

## What we’re doing

Lift **stances** from tools you actually liked — Rails, Unix/Linux, CodeIgniter 2, Laravel — into portable craft language. Keep product/stack depth in the consumer repo (`devops/`).

**North stars to try (not all as skills):**

| Stance | Source | Kit home (proposed) |
|--------|--------|---------------------|
| Convention over configuration | Rails | **Craft lens now** |
| Omakase (chef’s choice / opinionated defaults) | Rails + Japanese | Vocab seed → maybe craft one-liner |
| Orchestration vs program | this kit + Rails “no one paradigm” | Craft lens (already) |
| Human/programmer happiness | Rails | Ambient collaboration — not a product manifesto |
| Composability / text / one job | Unix/Linux | Tension with omakase — name it, don’t pick a winner |
| Stay out of the way / skinny core | CodeIgniter 2 | Kit travel-light; thin wrappers |
| Batteries with an escape hatch | Laravel | Omakase + sharp knives; don’t trap people in magic |

**Stay out of:** majestic-monolith vs microservices as kit doctrine. Prefer monoliths sometimes; that’s a product call, not a slash skill.

---

## Observed gap (Ansible + agents)

Codex (and similar) often **adds variables/toggles** while walking a canary or experiment: extra `when:` flags, feature switches in `defaults/main.yml`, “safer” off-ramps each increment.

That can be **ukemi** (cheap fall for the next apply) or **unpaid configuration** (every extra knob is a convention you didn’t pick).

**Working characterization (refine in use):**

| Knobs that earn their keep | Knobs that rot |
|----------------------------|----------------|
| Named experiment/canary, **default follows house convention**, timeboxed, removed when the path wins | Open-ended `enable_foo` / `mode` / `strictness` with no kill-by |
| One off-ramp for a risky step (ukemi) | A matrix of flags so every customer is a unique dialect |
| Documented in the role README as *temporary* | Agent-added “for safety” that become the public API |

**Craft prompt:** “Is this toggle the experiment’s mat, or a new configuration surface?” After the canary: **collapse into convention** (CoC) or extract a program (orchestration vs program) — don’t leave the scaffolding.

---

## Convention over configuration — build plan

**Promote now** as a craft lens (see `ENGINEERING-PRINCIPLES.md`).

**Later (only if misses continue):**

1. One Ansible kihon bullet: *defaults over extra-vars; new `enable_*` needs a reason* — still not a 20-line Ansible style guide.
2. Agent-facing example in craft output: flag “new toggle with no default path.”
3. Field Notes `devops/ansible/` can show the house convention (FQCN, inventory layout) — kit stays generic.

---

## Omakase (お任せ)

**English:** “I leave it to the chef” — you get the house menu, not a 40-page options list.

**Kit:** Opinionated *defaults* for glue (one way to test, lint, deploy). Complements CoC. Japanese cousin of Rails “the menu is omakase.” Vocab in `MARTIAL-VOCABULARY.md`; not a skill. Tension with Linux “explicit config and many composable tools” — **omakase for the path, Unix for the programs on the path.**

---

## Happiness as north star

Two layers — don’t mash them:

1. **Collaboration happiness** (kit): shorter over longer, sharp questions, don’t make humans debug a YAML dialect or fluent-but-wrong RCA. Already ambient in WORKING-STYLE / AGENTS.
2. **Product happiness** (DHH): optimize the *user of the software* for joy. Optional consumer essay; dangerous as a kit slogan (sounds like marketing). If promoted: one ambient line — “optimize for the next human on this repo, including 3am you.”

---

## Other frameworks — what to steal (not copy)

### Unix / Linux

- **Do one thing; compose** — scripts/operators you can grep and pipe; matches “extract a program.”
- **Text and explicitness** — logs, manifests, policies you can read without a framework runtime.
- **Don’t break userspace** — stable contracts (APIs, CRDs, playbook interfaces) once others depend on them.
- **Tension:** distros and Kubernetes are full of policy; “mechanism not policy” is an ideal, not OCP reality. Don’t fight the platform with kit slogans.

Steal: composable programs + readable artifacts. Don’t steal: anti-convention purity that fights CoC.

### CodeIgniter 2

- **Skinny core, obvious folders** — convention as *layout you can see*, little magic.
- **Stay out of the way** — you can read the framework; matches kit travel-light and thin consumer wrappers.
- **Documentation as the product** — forms people can follow.

Steal: visible convention, low magic, docs that are the form. Don’t steal: PHP-era helper sprawl.

### Laravel

- **Batteries included** with a known happy path (Artisan, Eloquent, migrations) — omakase.
- **Escape hatches** — you can drop to SQL / plain PHP when the magic lies.
- **Closer to Rails than CI2** — more magic, more happiness *if* you stay on the path.

Steal: one blessed path + an escape hatch (orchestration vs program). Don’t steal: facade/magic as a goal for Ansible YAML.

---

## Build sequence

| Step | What | When |
|------|------|------|
| 1 | CoC craft lens + this file | now |
| 2 | Omakase vocab; optional one-liner next to CoC | with CoC |
| 3 | Use CoC on a real Codex Ansible PR — refine the toggle/ukemi characterization | next real miss |
| 4 | Happiness: collaboration line only if AGENTS isn’t already enough | if needed |
| 5 | Linux/CI2/Laravel: keep as this map unless a lens fires twice | parked |

**Reject:** `/omakase`, `/linux`, `/laravel` skills. **Reject:** kit taking a monolith side.

---

## Promotion checklist

Same as martial vocab: repeated gap, existing lens insufficient, prefer a paragraph over a skill, don’t duplicate kihon.
