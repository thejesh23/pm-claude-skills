---
skill: gantt-roadmap
title: Gantt Roadmap
input: "Build a Q3 roadmap for shipping a new analytics dashboard: discovery + spec in July, build (core, then integrations) through August, beta late August, GA mid-September. Show dependencies and the key milestones."
source: hand-written example
---

# Analytics Dashboard — Q3 roadmap

A ~10-week plan from discovery to GA, with the build phase gated on spec sign-off and integrations gated on the core build.

```mermaid
gantt
    title Analytics Dashboard — Q3 roadmap
    dateFormat YYYY-MM-DD
    axisFormat %b %d
    section Discovery
        User research        :done,      r1, 2026-07-01, 10d
        Spec sign-off        :milestone, m1, 2026-07-15, 0d
    section Build
        Core dashboard       :active,    b1, after m1, 21d
        Integrations         :           b2, after b1, 12d
    section Launch
        Beta (design partners) :milestone, m2, 2026-08-27, 0d
        Hardening & fixes      :           h1, 2026-08-27, 12d
        GA                     :milestone, m3, 2026-09-14, 0d
```

**Critical path** — Spec sign-off → Core dashboard → Integrations → Beta → Hardening → GA. Any slip in the core build pushes GA day-for-day.

**Risks / buffers** — Integrations depend on a third-party API still in review; if it slips, beta moves with it. The 12-day hardening window between beta and GA is the only real buffer — protect it.

**Assumptions** — durations are planning estimates from a single start date (2026-07-01); dates are ISO so this also exports straight to a calendar (.ics).
