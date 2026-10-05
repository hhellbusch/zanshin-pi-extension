---
name: domain-language
description: >
  Audit established domain terms across glossaries, ADRs, code, schemas, APIs,
  tests, UI, and external contracts. Report which source owns each meaning.
  Use when the user says /domain-language, "term audit", "glossary drift",
  "who owns this word", or "do these names mean the same thing?".
argument-hint: "[term | path | topic]"
allowed-tools: Read Grep Glob Shell
---

# Domain language — term alignment (invoked)

<objective>
Report how an **established** domain term is used across surfaces, and which source owns each meaning. Evidence only.

Do not invent a new canonical meaning. Do not rewrite an ADR, rename code, or “fix” history in the same pass. If a human decision is required, classify it contradiction or unresolved and stop.
</objective>

<constraints>
- Established terms only — not greenfield naming brainstorms
- Quote or cite the surface (path, symbol, field, sentence). No paraphrase-as-proof
- One term (or a tight cluster the user named) per invoke
- Classify each mismatch; do not collapse them into “inconsistent”
- Not `/shoshin` (is the problem framed right?), `/craft` (engineering tradeoff), or an ADR (record a decision)
</constraints>

<process>

### 1. Name the term

From `$ARGUMENTS`, or ask once which term. If a path is given, extract the term and still search the other surfaces.

### 2. Collect surfaces

Search what exists in the repo (skip empty categories):

| Surface | Look for |
|---------|----------|
| Glossary / docs | definitions, READMEs that define the word |
| ADR | decision text that binds a meaning |
| Code | types, functions, comments that define behavior |
| Schema | fields, enums, DB names |
| API | paths, payload fields, error codes |
| Tests | fixtures and assertions that encode meaning |
| UI | labels and copy |
| External contract | OpenAPI, public docs, partner payloads |

Note the **owner** when a surface says it is authoritative (ADR status Accepted, published contract, glossary titled as such). If none claims ownership, say **unowned**.

### 3. Classify each difference

One class per difference. Precedence when two seem to fit:

1. **Contradiction** — same token, incompatible meanings (lifecycle vs identity is the usual case), even if both sides claim to be the owner
2. **Intentional translation** — a documented boundary (glossary, ADR, contract) says both names are the same thing at different edges
3. **Legacy name** — old token remains, behavior follows the current owner, and no document explains the boundary
4. **Unresolved** — sources differ, you cannot show they are incompatible, and no accepted owner exists

Do not emit contradiction until the surfaces that exist have been checked. A missing search is not a contradiction.

### 4. Report

Use the output format. Name a human decision only for **contradiction** or **unresolved**. Do not pick the winner.

</process>

<output_format>

```
## Domain language — [term]

| Surface | Meaning (cite) | Owner? |
|---------|----------------|--------|
| … | path: quote | yes / no / unowned |

### Differences
- **[class]:** [one sentence + cites]

### Do not change yet
[What this audit refuses to rewrite]

### Needs a decision?
yes (who should decide) | no
```

</output_format>

<classification_key>

Author check for the classes. Do not execute these against the user's repo, and do not append them to a real audit.

**Intentional translation, not legacy.** Public field `accountId`. Column `user_id`. Glossary: “accountId is the customer-facing id; user_id is the storage key for the same row.” The word “legacy” in that sentence does not make the class legacy name — the boundary is documented. Do not rename the column.

**Legacy name.** Code still says `user_id`. Docs and API say `accountId` for the same row. Nothing documents a boundary. Behavior follows `accountId`. Class: **legacy name**.

**Contradiction.** Glossary: `retired` = product no longer sold. Identity service: `retired` = credential revoked, person record still active. Tests assert both. Class: **contradiction**. Report both. Do not pick one.

</classification_key>

<failure_modes>

- Silent canon: choosing a meaning and editing code/docs in the same turn
- Single-surface audit: only reading the glossary
- Calling every alias a contradiction
- Rewriting an Accepted ADR because a new name “seems clearer”

</failure_modes>

<success_criteria>

- Every meaning has a cite
- Each difference has one class from the table
- No renames or new definitions committed as part of the audit
- The classification key cases classify as specified, and are not pasted into the user's audit

</success_criteria>
