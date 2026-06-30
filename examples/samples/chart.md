---
skill: chart
title: Chart
input: "Chart our 2026 H1 metrics: MRR in $k was 120, 138, 151, 167, 180, 201 from Jan to Jun; churned MRR was 8, 9, 7, 11, 9, 8 over the same months. Show the trend for both."
source: hand-written example
---

### MRR is compounding while churn stays flat

Revenue climbed from $120k to $201k over H1 (+68%) while churned MRR held in a tight $7–11k band — so almost all the growth is net-new, not a leaky-bucket treadmill.

```chart
{
  "type": "line",
  "title": "MRR vs. churned MRR — 2026 H1 ($k)",
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "series": [
    { "name": "MRR ($k)", "data": [120, 138, 151, 167, 180, 201] },
    { "name": "Churned ($k)", "data": [8, 9, 7, 11, 9, 8] }
  ]
}
```

**Notes** — both series share the same $k scale, so a single axis is honest here. A natural follow-up is a churn-*rate* chart (churned ÷ start-of-month MRR), since flat absolute churn against a growing base means the rate is actually improving.
