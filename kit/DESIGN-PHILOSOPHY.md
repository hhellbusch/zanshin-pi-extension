# Design philosophy

> Portable **stances** borrowed from tools that earned trust — not a doctrine dump, not slash skills.  
> Date: 2026-10-05  
> Craft lenses live in `ENGINEERING-PRINCIPLES.md`. Dojo names live in `MARTIAL-VOCABULARY.md`. Forms live in `kihon/`.

---

## North star map

| Stance | Steal from | Kit home | Status |
|--------|------------|----------|--------|
| Convention over configuration | Rails | Craft lens | **Active** |
| Orchestration vs program | this kit + Rails “no one paradigm” | Craft lens | **Active** |
| Omakase (お任せ) — house defaults | Rails + Japanese | Vocab + CoC companion | **Light** |
| Collaboration happiness (next human on the repo) | Rails “programmer happiness,” narrowed | Ambient / craft one-liner | **Light** |
| Compose programs; readable text; stable contracts | Unix / Linux | Complements extract-a-program | **Map** |
| Skinny core, visible layout, low magic | CodeIgniter 2 | Travel-light; thin wrappers | **Map** |
| Blessed path + escape hatch | Laravel | Omakase + sharp knives | **Map** |

**Stay out of the kit:** monolith vs microservices as doctrine; product-marketing “happiness”; `/omakase` / `/linux` / `/laravel` skills.

---

## Active craft stances (summary)

Full text: `ENGINEERING-PRINCIPLES.md`.

### Convention over configuration

One boring **default path**. Extra knobs are unpaid configuration unless they are a **timeboxed canary** (then delete).

**Agent toggle / canary tension** (Ansible + Codex-class models):

| Earns its keep | Rots |
|----------------|------|
| Named experiment, default = house convention, kill-by date | Open-ended `enable_*` / `mode` / `strictness` |
| One off-ramp for a risky step (**ukemi**) | Flag matrix → every customer a dialect |
| Documented as temporary | Agent “for safety” knobs that become the public API |

**Craft prompt:** *Is this toggle the experiment’s mat, or a new configuration surface?* After the canary: collapse into convention or extract a program.

### Orchestration vs program

CI / Ansible / Helm are **glue**. When the YAML is an untested program, extract a script/module/image. Don’t extract on the first `when:` (YAGNI). Bar: *where the program lives*.

### Omakase

Chef’s choice: the house menu for glue (one way to test, lint, deploy). **Omakase for the path; Unix for the programs on the path.** Not “ban flags”; “don’t make humans pick forty defaults.”

### Collaboration happiness

Optimize for the **next human on this repo** (including 3am you and the next agent): short answers, sharp questions, fail loud, don’t invent a YAML dialect. Distinct from product “user joy” marketing — that belongs in consumer essays if at all.

---

## Borrowings (steal, don’t copy)

### Rails (DHH / [The Rails Doctrine](https://rubyonrails.org/doctrine))

| Steal | Don’t steal |
|-------|-------------|
| CoC, omakase defaults, no-one-paradigm (YAML ≠ runtime) | Full doctrine as kit law |
| Sharp knives (powerful tools cut you if misused) | Majestic monolith as always-right |

### Unix / Linux

| Steal | Don’t steal |
|-------|-------------|
| Do one thing; compose (matches extract-a-program) | Anti-convention purity that fights CoC |
| Text you can grep; contracts that don’t break userspace | Pretending K8s/OCP has no policy |

### CodeIgniter 2

| Steal | Don’t steal |
|-------|-------------|
| Obvious folders; skinny core; docs as the form | Helper sprawl; magic for its own sake |
| Stay out of the way (read the framework) | |

### Laravel

| Steal | Don’t steal |
|-------|-------------|
| Batteries + known happy path; escape hatch when magic lies | Facades/magic as a goal for Ansible YAML |

---

## Named tensions (don’t resolve in the abstract)

| Tension | Hold both |
|---------|-----------|
| **Omakase vs Unix** | House path for glue; composable programs on the path |
| **CoC vs ukemi** | Defaults win; temporary mats for canaries, then delete |
| **CoC vs YAGNI extract** | Don’t add knobs “for later”; don’t extract a framework on first miss |
| **Orchestration vs program** | Glue stays YAML; logic you debug belongs in a language you can test |
| **Happiness vs rigor** | Kind to humans ≠ skip verification or spar |

---

## What is not kihon

Philosophy and judgment stay here / in craft. Kihon is only **easy pitfalls + quality signals** (`kihon/README.md`). A fat design essay is never a `/kihon` domain.

---

## Promotion checklist

1. Repeated gap in real sessions (not aesthetic fit)  
2. Existing lens insufficient  
3. Prefer a craft paragraph over a new skill  
4. Prefer consumer essay for product philosophy  
5. Don’t duplicate martial vocab or kihon  

**Next use-test:** run `/craft` on a Codex-grown Ansible defaults forest; refine the toggle/ukemi table from evidence.
