# The SkillSpec Foundation — the standard's independence trajectory

Standards win when they stop belonging to one project. This document is the commitment and the runbook for spinning SkillSpec into a neutral home.

## Why (stated against our own interest)
SkillSpec adoption is capped by its address: authors of competing skill libraries won't build on "a competitor's spec." A neutral org with co-maintainers removes that objection — and the census (thousands of authors) shows exactly who to invite.

## What moves
`SKILLSPEC.md` + `spec/skill.schema.json` + `skillspec/` (validator) + `.pre-commit-hooks.yaml` + the badge service → **github.com/skillspec/spec** (new org). This repo becomes the standard's *largest implementation*, not its owner.

## Governance (from day one at the new org)
- **RFC process** ([RFC template](rfcs/0000-template.md)): any change to conformance levels or the security pattern set lands as an RFC PR with a 14-day comment window; two maintainer approvals to merge.
- **Maintainers**: the founding maintainer + standing invitations to the two largest non-fork adopters found by each quarterly census. Maintainership is earned by adoption, not granted by friendship.
- **The one non-negotiable**: verifiability principles (open validator, published methods) are constitutional — changeable only by unanimous maintainers + 30-day window.

## The spin-out runbook (owner actions, ~1 hour)
1. Create the GitHub org (`skillspec`) and repo (`spec`); enable the same branch protection.
2. `git subtree split` the paths above (history-preserving) and push.
3. npm: transfer or re-scope `skillspec-check`; keep the old name as a deprecation shim for 6 months.
4. Redirect: this repo's SKILLSPEC.md becomes a pointer + pinned copy of the version it implements.
5. First RFC: "RFC-0001: SkillSpec 1.0 as-is" — ratifies the current text so the org's first act is legitimacy, not change.

## Adopters (grows by PR — add yourself)
| Project | What it uses |
|---|---|
| [pm-claude-skills](https://github.com/mohitagw15856/pm-claude-skills) | Full: 466 skills at L3, CI gate, badge, census grading |
