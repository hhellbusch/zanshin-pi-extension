# AI-Assisted Content — Review Conventions

Content in this project was produced with AI assistance. The author described intent, provided context, and steered direction. The AI performed research, synthesis, drafting, and code generation. The author has not necessarily reviewed all output in detail.

---

## Review status

Files may note review status in YAML frontmatter:

```yaml
review:
  status: direction-reviewed    # or reviewed, or unreviewed
  date: YYYY-MM-DD
  type: [read, tested, voice-approved]
```

**Three states:**

- **reviewed** — The author has read and validated the content
- **direction-reviewed** — The author guided the creation and reviewed the approach, but not line-by-line. Typical for AI-assisted content.
- **unreviewed** — Generated but not revisited. Treat with extra caution.

When no status is noted, assume **direction-reviewed** — the author shaped the intent but the AI wrote the words.

## Validation types

| Content | Types |
|---------|-------|
| Essays and guides | `read`, `fact-checked`, `voice-approved` |
| Code and examples | `read`, `tested` |
| Runbooks and commands | `read`, `commands-verified` |
| Research and sources | `read`, `sources-checked` |

**`voice-approved`** means the author has validated content that speaks in their voice — biographical claims, professional identity, personal opinions. AI writes in the author's voice by default, so readers attribute these statements directly. Content with biographical elements lacking `voice-approved` should be treated with extra caution.

---

## Standard footer

New AI-assisted documents carry this footer until reviewed:

> *This document was created with AI assistance and has not been fully reviewed by the author.*

Update to "has been reviewed" when the author has read and validated the content.

---

## What to assume

- **Prose and synthesis** are AI-generated based on the author's direction. Informed drafts, not peer-reviewed.
- **Technical examples** are functional starting points. Test and cross-reference with official documentation.
- **Research artifacts** were gathered and organized by AI. Source material is real; summaries are interpretations.
- **Verify currency.** AI training data has a cutoff. Check approaches against current best practices.
