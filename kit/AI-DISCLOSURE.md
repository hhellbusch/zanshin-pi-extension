# AI-Assisted Content Disclosure

Content in this project was produced with AI assistance. This document defines how to interpret that, what review status means, and what to assume when no status is noted.

---

## What "AI-assisted" means

Most content was produced through directed conversation: the author described intent, provided context, and steered direction, while the AI performed research, synthesis, drafting, and code generation. The author has not necessarily reviewed all output in detail.

This is an honest accounting. The author's voice, judgment, and decisions are present — but the words are often largely AI-generated.

---

## Review status

Individual files may note their review status in YAML frontmatter:

```yaml
review:
  status: reviewed        # or direction-reviewed, or unreviewed
  date: YYYY-MM-DD
  type: [read, tested, fact-checked, ...]
```

**Three states:**

- **Reviewed** — The author has read and validated the content. Specific validation types are noted.
- **Direction-reviewed** — The author guided the creation and reviewed the approach, but has not read the full output line-by-line. This is the typical state for most AI-assisted content.
- **Unreviewed** — Generated but not yet revisited. Treat with extra caution.

When no review status is noted, assume **direction-reviewed** — the author shaped the intent but the AI wrote the words.

---

## Validation types

Different content requires different kinds of validation:

| Content | Validation types |
|---|---|
| Essays and guides | `read`, `fact-checked`, `voice-approved` |
| Code and examples | `read`, `tested` |
| Runbooks and commands | `read`, `commands-verified` |
| Research and sources | `read`, `sources-checked` |
| Tooling and config | `read`, `used-in-practice` |

**`voice-approved`** has special significance: it means the author has reviewed content that speaks in their voice — biographical claims, professional identity, personal opinions, experience statements. AI writes in the author's voice by default, so readers attribute these statements directly to the author. Content with biographical elements that lacks `voice-approved` should be treated with extra caution.

---

## Standard footer

New AI-assisted documents carry this footer until reviewed:

> *This document was created with AI assistance and has not been fully reviewed by the author.*

Update to "has been reviewed" when the author has read and validated the content.

---

## What to assume

- **Prose and synthesis** are AI-generated based on the author's direction. Treat as informed drafts, not peer-reviewed publications.
- **Technical examples** are functional starting points. Test in your environment and cross-reference with official documentation.
- **Research artifacts** were gathered and organized by AI. Source material is real; summaries and annotations are AI interpretations.
- **Verify currency.** AI training data has a cutoff. Check that approaches align with current best practices for your tool versions.
