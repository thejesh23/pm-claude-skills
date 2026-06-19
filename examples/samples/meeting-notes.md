---
skill: meeting-notes
title: Meeting Notes
input: "Transcript of a 30-min product/eng sync: debated whether to delay the checkout launch over a payments edge case; agreed to ship behind a flag to 10% on Thursday; Priya to write the rollback runbook; Sam worried about PCI scope; decided to ask Legal by Tuesday."
source: representative example (hand-written)
---

# Product / Eng Sync — Checkout Launch

**Date:** (meeting date) · **Attendees:** Product, Eng, (Priya, Sam) · **Purpose:** Decide checkout launch timing

## Decisions
- ✅ **Ship checkout behind a feature flag to 10% of traffic on Thursday** — not a full launch, to contain the payments edge case.
- ✅ **Confirm PCI scope with Legal before expanding past 10%.**

## Action items
| Owner | Action | Due |
|-------|--------|-----|
| Priya | Write the rollback runbook for the checkout flag | Before Thursday |
| Sam | Document the payments edge case + PCI scope question for Legal | Mon |
| (Lead) | Get Legal's read on PCI scope | Tue |

## Open questions / risks
- **PCI scope (Sam):** does the new checkout path widen our PCI compliance surface? Blocks expansion beyond 10%.
- **Edge case:** the payments failure path isn't fully characterised — the 10% rollout is partly to observe it in production.

## Not decided
- Full-launch date — gated on the 10% results and Legal's answer.
