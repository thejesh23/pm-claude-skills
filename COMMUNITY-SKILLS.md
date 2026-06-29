# Community Skills

A directory of **skill repos and packs built by the community** that follow the
[`SKILL.md` standard](SKILL-AUTHORING-STANDARD.md). Think of it as the wider ecosystem
around this project — a place to discover skills others have made and to share your own.

> [!IMPORTANT]
> **This is not the curated library.** The skills *in this repo* (`skills/`) are
> single-source, **SkillCheck-validated**, **eval-scored** on a public rubric, and scanned
> by the [skill security auditor](skills/skill-security-auditor/SKILL.md) — they power the
> [playground](https://mohitagw15856.github.io/pm-claude-skills/), the MCP server, the REST
> API, and the [leaderboard](https://mohitagw15856.github.io/pm-claude-skills/leaderboard.html).
>
> Entries **below** are **community-contributed and live in their authors' own repos.** They
> are **not eval-scored, not security-audited, and not maintained by this project.** Review
> the source and **install at your own discretion.** Listing here is not an endorsement.

---

## The directory

| Skill / pack | Author | What it does | Link |
|---|---|---|---|
| _Be the first — open a PR to add yours!_ | | | |

<!--
  Add your row directly above this comment, keeping the columns in order:
  | [Name](https://github.com/you/your-repo) | [@you](https://github.com/you) | One concise line — what it produces and when to use it. | `github.com/you/your-repo` |
  Keep the description to a single line. Alphabetical-ish by name is fine.
-->

---

## Add yours

It's a one-row pull request:

1. Make sure your skill is a **public repo** containing one or more `SKILL.md` files that
   follow the [authoring standard](SKILL-AUTHORING-STANDARD.md) (frontmatter `name` +
   `description`, a clear output structure, quality checks). The
   [`writing-great-skills`](skills/writing-great-skills/SKILL.md) skill can help.
2. Add **one row** to the table above with: name (linked to your repo), your handle, a
   one-line description, and the repo URL.
3. Open a PR titled `community: add <your skill/pack>`.

**Guidelines for listing** (keeps the directory trustworthy):

- ✅ The link resolves to a public repo with at least one valid `SKILL.md`.
- ✅ A clear, honest one-line description — no marketing fluff.
- ✅ Open-source or clearly-licensed; safe content (no prompt injection, exfiltration, or
  hidden instructions — see the [security standard](SECURITY.md)).
- ❌ No paywalled-only, dead, or unrelated links; no duplicates.

Maintainers may remove entries that go stale, break, or don't meet these guidelines.

---

## Want your skill in the *curated* library instead?

If you'd like your skill to be eval-scored and available in the playground, MCP, and every
export target, contribute it to the core library through the quality-gated flow:

- Use **[Skill Studio](https://mohitagw15856.github.io/pm-claude-skills/studio.html)** to
  generate a standards-compliant `SKILL.md` and open a prefilled PR in one click, **or**
- Follow [`CONTRIBUTING.md`](CONTRIBUTING.md) — the PR check validates structure and
  cheaply eval-scores your changed skill before merge.

That path has a higher bar, but your skill becomes a first-class, measured part of the library.
