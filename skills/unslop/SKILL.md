---
name: unslop
description: >-
  Cut AI tells from writing. Use when the user says /unslop, "unslop this",
  or asks to strip AI patterns from a draft, doc, or essay.
argument-hint: "[file path | inline content from conversation]"
allowed-tools: Read Grep Glob
---

# Unslop — Cut AI Tells (Invoked)

<objective>
Edit text to remove AI patterns. Preserve meaning. Match the intended tone (this kit: practitioner, shorter over longer).

Derived from [cursor/plugins pstack unslop](https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md). Rule numbers stay stable so other skills can cite them. A removed rule leaves a gap.

**Not always-on.** Ambient brevity already lives in working style. This skill is a deliberate pass on a named draft.
</objective>

<process>

### Step 1: Identify the target

Parse `$ARGUMENTS`:

- **File path** → read the file
- **Inline / no path** → the most recent draft in conversation

If ambiguous, ask: "Which file or draft should I unslop?"

Do not rewrite YAML frontmatter `review:` blocks except to keep them valid.

### Step 2: Scan, rewrite, self-audit

1. Scan for the patterns below.
2. Rewrite. Preserve meaning. Match intended tone.
3. Self-audit: "What still makes this obviously AI generated?" Fix remaining tells.
4. If the consumer has a style guide (em dashes in titles, project jargon), keep those. Do not "unslop" a required convention.

### Step 3: Report then apply

If the user asked for a review only, list hits by rule id and stop.
If they asked to unslop the file, apply the rewrite.

</process>

<patterns>

Rule numbers are stable ids.

### Content

3. **Superficial -ing phrases.** "highlighting...", "ensuring...", "reflecting...", "showcasing...", "fostering...". Delete or expand with real sources.
5. **Vague attributions.** "Experts believe", "Industry reports suggest", "Some critics argue". Name the source or delete.

### Language

7. **AI vocabulary.** Additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape (abstract), pivotal, showcase, tapestry (abstract), testament, underscore, vibrant. Replace with plain words.
8. **Fancy ways to say "is".** "serves as", "stands as", "boasts", "features". Just say "is" or "has".
9. **"Not just X, but Y."** State the point directly instead.
10. **Rule of three.** Forcing ideas into groups of three. Use the natural number.
11. **Synonym cycling.** Protagonist, main character, central figure, hero all in one paragraph. Pick one, repeat it.
12. **False ranges.** "from X to Y" where X and Y are not on a meaningful scale. List topics directly.

### Style

13. **Em dash overuse.** Do not use em dashes as clause glue in body prose. Period or comma. Consumer style guides may still use an em dash in a title (`# Topic — subtitle`); keep that.
14. **Colon overuse.** Colons are fine before a list or example. Not as mid-sentence connectors.
15. **Boldface overuse.** Do not bold every proper noun or acronym.
16. **Inline-header lists.** The tell is a bold label and colon that restates the line. Convert those to prose. A bold lead-in that ends in a period and is followed by new detail is fine.
17. **Title case headings.** Sentence case unless the consumer style guide requires title case for `#` headings.
18. **Decorative emojis.** Remove from headings and bullets.
19. **Curly quotes.** Replace with straight quotes.

### Communication artifacts

20. **Chatbot phrases.** "I hope this helps!", "Let me know if...", "Of course!", "Certainly!", "Found the smoking gun!" Remove.
22. **Sycophantic tone.** "Great question! You're absolutely right!" Respond directly.

### Filler

23. **Filler phrases.** "In order to" becomes "To". "Due to the fact that" becomes "Because". "It is important to note that" gets deleted.
24. **Excessive hedging.** "could potentially possibly be argued that it might" becomes "may".
25. **Generic conclusions.** "The future looks bright." State specific plans or facts.

### Jargon

26. **Abstract metaphor nouns.** Substrate, wedge, vector, locus, vantage, nexus, primitive (as noun), harness (as metaphor), surface (as in "API surface"), bedrock, scaffolding (as metaphor), modality, paradigm, gold-plating, ratchet (as metaphor), evacuate (for moving code), endgame, north star, flywheel. Pick the concrete word. **Do not replace** when the word is the actual name of a thing in the project (this kit's "harness", Ambler's "sandbox", a product called Scaffold).

### Plain speech

27. **Say what it does, not how it feels.** If you cannot restate a sentence as a concrete instruction, fact, or number, cut it. If the sentence could appear unchanged in another project's docs, it says nothing about this one. Cut it.
28. **Shorten or split dense sentences.** One idea per sentence.
29. **Active voice.** Prefer it. Passive is fine when the actor is unknown or does not matter.
30. **Cut adverbs, or use a stronger verb.** "significantly improves" becomes the measured delta.
31. **Prefer the plain word.** "utilize" / "leverage" become "use". "facilitate" becomes "help".
32. **Mannered prose.** Aphorisms, rhetorical fragments, personified code, figurative verbs, stock framing. Say what you mean.
33. **Over-compression.** Dropped articles, verbless fragments, symbol-speak. Write whole sentences.

</patterns>

<failure_modes>

- **Fighting the style guide.** Stripping required title em dashes or project terms.
- **Always-on.** Running this on every reply. It is a pass on a draft.
- **Meaning change.** Cutting a hedge that was an honest limit.

</failure_modes>

<success_criteria>

- Hits cited by rule id when reporting
- Meaning preserved
- Self-audit named at least one remaining tell, or stated none remain
- Style-guide exceptions honored

</success_criteria>
