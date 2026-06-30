---
skill: flowchart
title: Flowchart
input: "Diagram the e-commerce checkout: review cart, enter shipping, choose payment, validate it. If payment is declined, allow up to 3 retries then cancel. If it succeeds, check inventory — in stock: confirm + email receipt; out of stock: refund + notify. Start at Checkout clicked; end states: confirmed, cancelled, refunded."
source: hand-written example
---

# Checkout — flowchart

The customer checkout flow, including the payment-retry loop and the inventory branch that can lead to a refund.

```mermaid
flowchart TD
    A([Checkout clicked]) --> B[Review cart]
    B --> C[Enter shipping address]
    C --> D[Choose payment method]
    D --> E{Payment valid?}
    E -->|Declined| F{Retries left?}
    F -->|Yes| D
    F -->|No, 3 failed| G([Order cancelled])
    E -->|Approved| H{In stock?}
    H -->|Yes| I[Confirm order]
    I --> J[Send receipt email]
    J --> K([Order confirmed])
    H -->|No| L[Refund payment]
    L --> M[Notify customer]
    M --> N([Order refunded])
```

**Legend / notes**
- Rounded nodes `([ ])` = start/end states, rectangles = actions, diamonds = decisions.
- The retry loop is capped at 3 attempts before the order is cancelled — protects against endless failed charges.
- Out-of-stock is handled *after* a successful charge, so it always triggers a refund + notification (a known friction point worth fixing upstream by checking stock before payment).

**Assumptions** — inventory is checked after payment authorization; "retries left" counts up to 3 total attempts.
