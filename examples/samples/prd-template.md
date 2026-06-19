---
skill: prd-template
title: PRD Template
input: "Feature: in-app referral program so existing users invite colleagues and both get a credit. Target: activated B2B users. Goal: grow signups 15% in Q3."
source: representative example (hand-written)
---

# PRD — In-App Referral Program

**Status:** Draft · **Owner:** PM · **Target release:** Q3

## Problem
Activated B2B users are our happiest segment, but we have no built-in way for them to bring colleagues in. Word-of-mouth happens off-platform and we capture none of it. Signup growth is flat at ~5%/qtr through paid channels alone.

## Goals
- Grow new signups **+15% in Q3** via referrals.
- Referral signups activate at **≥ the current baseline** (don't trade quality for volume).

## Non-goals
- Public/affiliate program for non-customers (separate effort).
- Cash payouts — credits only, this release.

## User stories
- *As an activated user,* I can invite a colleague by email or shareable link and see the reward I'll get.
- *As an invited colleague,* I land on a page that explains the credit and makes signup one click.
- *As a referrer,* I can see the status of my invites (sent / joined / credited).

## Functional requirements
1. Generate a unique referral link per user.
2. Both referrer and referee receive a **$X account credit** when the referee activates (not just signs up).
3. Referral dashboard: invites sent, joined, credit earned.
4. Fraud guardrail: credit only on activation + payment-method-on-file.

## Success metrics
| Metric | Baseline | Target |
|--------|:--------:|:------:|
| New signups from referrals | 0 | 15% of total Q3 signups |
| Referral → activation rate | — | ≥ overall baseline |
| Referrals sent per active user | — | ≥ 0.3 |

## Open questions
- Credit amount — what's the payback period at our LTV? (needs Finance)
- Does "activation" or "first payment" trigger the credit? (affects fraud + cost)
- Self-serve only, or also sales-assisted accounts?
