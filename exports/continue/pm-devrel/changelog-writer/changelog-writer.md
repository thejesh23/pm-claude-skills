---
name: "Turn a list of changes, commits, or PRs into clean release n"
description: "Turn a list of changes, commits, or PRs into clean release notes / a changelog entry. Use when asked to write release notes, a changelog, or a version announcement from raw changes. Produces a Keep-a-Changelog-style entry grouped by type (Added/Changed/Fixed/etc.), written for users — surfacing breaking changes and upgrade notes up top. To go straight from a raw git log use changelog-generator instead."
---

# Changelog Writer Skill

Raw commit logs are written for the author; a changelog is written for the *user*. This skill turns a pile of
commits/PRs/changes into a clean release entry — grouped by type, in plain user-facing language, with
**breaking changes and upgrade steps surfaced first** so nobody gets surprised.

## Required Inputs

Ask for these only if they aren't already provided:

- **The changes** — commit messages, PR titles, or a bullet list of what changed.
- **Version & date** — the release number (or help pick per semver) and date.
- **Audience** — end users, API consumers, library developers (sets the voice).
- **Conventions** (optional) — Keep a Changelog, an existing style, links to issues/PRs.

## Output Format

Follow [Keep a Changelog](https://keepachangelog.com) conventions:

### [version] — [date]

**⚠️ Breaking changes** (only if any) — each breaking change + the **exact migration step** to fix it. This goes first.

**Added** — new features/capabilities, in user terms.
**Changed** — changes to existing behavior.
**Deprecated** — soon-to-be-removed features (and what to use instead).
**Fixed** — bug fixes (what was broken, from the user's view).
**Security** — any security-relevant fixes.

(Omit empty sections.) Each line: user-facing outcome first, with an issue/PR reference if available — not the raw commit message.

**Upgrade notes** (if needed) — anything to do when upgrading beyond the breaking-changes steps.

**Semver note** — if the version was inferred, one line on why (breaking → major, feature → minor, fix → patch).

## Quality Checks

- [ ] Entries are grouped by type (Added/Changed/Fixed/…) with empty sections omitted
- [ ] Breaking changes are surfaced first, each with a concrete migration step
- [ ] Lines are user-facing outcomes, not raw commit messages
- [ ] References (issues/PRs) are included where available
- [ ] The version respects semver (breaking→major, feature→minor, fix→patch)

## Anti-Patterns

- [ ] Do not paste raw commit messages — translate to what the user gains or must do
- [ ] Do not bury breaking changes among the features — they go first, with migration steps
- [ ] Do not include internal-only noise (refactors, CI tweaks) the user doesn't care about
- [ ] Do not mix change types into one list — group them
- [ ] Do not misclassify the version bump — a breaking change is a major, not a patch

## Based On

The Keep a Changelog standard and Semantic Versioning, written for the reader rather than the committer.
