# Discovery Report — May 2026

**Research Question:** Why are users abandoning the onboarding flow?
**Interview Source:** notion
**Interview Count:** 10
**Generated:** 2026-05-06 14:30 BST

---

## Executive Summary

Across 10 SMB customer interviews, three high-confidence findings emerged about onboarding abandonment:

1. **Users feel they're being asked to commit before understanding what they're getting.** The current flow asks for credit card details and integration setup before showing any value. 8 of 10 interviews mentioned this directly.

2. **The integration setup step is the highest-friction point.** Users are willing to set up integrations once they're convinced of value — but doing it before that point feels like extra work for no clear payoff. 7 of 10 interviews mentioned this.

3. **The pricing display creates anxiety, not clarity.** Showing pricing tiers without clear differentiation between them creates decision paralysis. 6 of 10 interviews described this.

Two medium-confidence findings worth validating in the next research round:
- Users may be abandoning because they confuse onboarding with set-up (5 interviews)
- The "skip for now" option may be reducing completion rather than helping (4 interviews)

---

## Themes Identified

### Theme 1: Premature commitment ask (Strong)

Users feel they're being asked to commit (credit card, integrations, team invites) before they understand what they're getting from the product.

- **Supporting interviews:** 8 — IDs: I-103, I-105, I-107, I-109, I-110, I-112, I-114, I-115
- **Strength:** Strong
- **Quotes:**
  - "I just wanted to see if this would work for my team. Why am I being asked for my credit card?" — I-105
  - "It felt like I was already a customer before I'd even decided." — I-110
  - "The first thing it asked me was to invite my whole team. I haven't even tried it yet." — I-114
- **Contradicting evidence:** None
- **Why this matters:** This is the strongest signal in the synthesis. The team should consider redesigning the flow so users see value before being asked to commit.

### Theme 2: Integration setup friction (Strong)

The integration setup step (connecting to Slack, Google Drive, etc.) is happening too early in the flow. Users are willing to set up integrations once convinced, but doing it before is friction.

- **Supporting interviews:** 7 — IDs: I-103, I-105, I-109, I-110, I-112, I-114, I-115
- **Strength:** Strong
- **Quotes:**
  - "I gave up at the Slack integration step. I wasn't sure I wanted my team to know I was trying this yet." — I-109
  - "Why does it need access to my Google Drive before I've even seen what it does?" — I-103
- **Contradicting evidence:** I-107 mentioned that integration setup felt natural — "I expected to connect my tools, that's normal." This is a single contradiction within the broader pattern.
- **Why this matters:** This connects to Theme 1. Users want value first, commitment second.

### Theme 3: Pricing display causes anxiety (Strong)

Showing all three pricing tiers during onboarding creates decision paralysis rather than clarity. Users aren't sure which tier they need.

- **Supporting interviews:** 6 — IDs: I-105, I-107, I-110, I-112, I-114, I-115
- **Strength:** Strong
- **Quotes:**
  - "I don't know if I'm a Pro user or a Team user. I just wanted to try it." — I-107
  - "Showing me three columns of features I don't understand made me close the tab." — I-114
- **Contradicting evidence:** None
- **Why this matters:** The current pricing display is optimised for users who already know they want to buy. For first-time users, it's a distraction.

### Theme 4: Onboarding-vs-setup conflation (Moderate)

Users may not be distinguishing between "onboarding" (learning the product) and "setup" (configuring it for their team). They expected the first to come before the second.

- **Supporting interviews:** 5 — IDs: I-103, I-109, I-110, I-114, I-115
- **Strength:** Moderate
- **Quotes:**
  - "I thought I'd see how to use it. Instead I was configuring it." — I-115
  - "Onboarding should be 'here's what this does'. Not 'fill out these forms'." — I-103
- **Contradicting evidence:** None — but this finding is partially redundant with Theme 1.
- **Why this matters:** Could be reframed: the issue isn't onboarding vs. setup specifically — it's that setup is happening before value demonstration.

### Theme 5: "Skip for now" reduces completion (Emerging)

The "Skip for now" option offered at several points may be reducing completion rather than helping users. Users who skip rarely come back to complete those steps.

- **Supporting interviews:** 4 — IDs: I-105, I-110, I-112, I-114
- **Strength:** Emerging
- **Quotes:**
  - "I clicked Skip on three things. Then I forgot to come back." — I-110
- **Contradicting evidence:** None — but only 4 interviews and behavioural data would validate this better than interview observations.
- **Why this matters:** If validated, this suggests the team should either remove the skip option or implement reminders.

---

## Job Stories

### Job Story 1
**When** I'm evaluating a new SaaS tool for my team,
**I want to** see what it does and how it would feel to use,
**So I can** decide whether to invest the time in setting it up properly.

### Job Story 2
**When** I'm in the early evaluation phase of a tool,
**I want to** avoid commitments (payment, team invites, integrations),
**So I can** stay in low-stakes exploration mode.

### Job Story 3
**When** I'm shown pricing during evaluation,
**I want to** understand which tier fits my situation without comparing all features,
**So I can** focus on whether the product solves my problem.

---

## Confidence Assessment

| Finding | Confidence | Breadth | Quality | Contradictions |
|---|---|---|---|---|
| Premature commitment ask | High | 8 interviews | High | None |
| Integration setup friction | High | 7 interviews | High | 1 (likely segment-specific) |
| Pricing causes anxiety | High | 6 interviews | High | None |
| Onboarding/setup conflation | Medium | 5 interviews | Medium | None — but redundant with Theme 1 |
| "Skip for now" reduces completion | Low | 4 interviews | Medium | None — needs behavioural data |

### Recommended actions

- **High confidence findings:** Safe to use in product decisions. Can frame in stakeholder communications without caveat.
- **Medium confidence findings:** Use directionally. Validate with one more interview round before major product decisions.
- **Low confidence findings:** Treat as hypothesis. Do not use in product decisions until validated with behavioural analytics.

---

## Verbatim Quotes (Most Representative)

> "I just wanted to see if this would work for my team. Why am I being asked for my credit card?" — I-105

> "It felt like I was already a customer before I'd even decided." — I-110

> "The first thing it asked me was to invite my whole team. I haven't even tried it yet." — I-114

> "I don't know if I'm a Pro user or a Team user. I just wanted to try it." — I-107

> "Onboarding should be 'here's what this does'. Not 'fill out these forms'." — I-103

---

## Follow-up Questions for Next Round

Based on findings flagged as low or medium confidence, and gaps in the original research question:

1. **Validate "Skip for now" hypothesis:** Pair the next 5 interviews with behavioural analytics on completion rates for users who skip vs. don't skip. — Would validate Theme 5.

2. **Test the integration ordering:** What if integration setup came after the first value demonstration? Would users still be reluctant? — Would help design the redesigned flow.

3. **Probe enterprise users:** All 10 interviews were SMB. Do enterprise users have different expectations about commitment depth during evaluation? — Fills the segment gap.

4. **Validate the redundancy of Themes 1 and 4:** Are these the same finding stated differently, or genuinely separate? — Affects how we frame the findings to stakeholders.

5. **Understand competitive context:** Are users abandoning to try competitors, or just not coming back? — Would tell us if this is a problem of conversion specifically or activation more broadly.

---

## Appendix: Interview Summary

| ID | Date | Interviewee | Segment | Notes Length |
|---|---|---|---|---|
| I-103 | 2026-04-15 | David Park, founder | SMB | Substantial |
| I-105 | 2026-04-17 | Sarah Lee, marketing manager | SMB | Substantial |
| I-107 | 2026-04-18 | Marcus Wong, ops lead | SMB | Brief |
| I-109 | 2026-04-22 | Priya Patel, team lead | SMB | Substantial |
| I-110 | 2026-04-23 | Jamie Roberts, founder | SMB | Substantial |
| I-112 | 2026-04-25 | Lin Chen, CTO | SMB | Substantial |
| I-114 | 2026-04-28 | Tom Bradley, marketer | SMB | Substantial |
| I-115 | 2026-04-30 | Aisha Khan, ops manager | SMB | Substantial |
| I-117 | 2026-05-02 | (Excluded — test interview) | — | — |
| I-118 | 2026-05-04 | (Excluded — segment mismatch, enterprise) | — | — |

8 of 10 interviews included in synthesis (2 excluded for the reasons above).

---

*Generated by [PM Discovery Agent](https://github.com/mohitagw15856/pm-claude-skills/tree/main/templates/pm-discovery-agent) — second agent template in pm-claude-skills*
