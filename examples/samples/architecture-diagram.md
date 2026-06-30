---
skill: architecture-diagram
title: Architecture Diagram
input: "Diagram the architecture of a SaaS app: web and mobile clients hit an API gateway, which talks to an auth service and an orders service. Orders uses Postgres and Redis, and publishes events to a queue that a notifications worker consumes to send email via a third-party provider."
source: hand-written example
---

# SaaS app — architecture

End-to-end request and event flow for the order path, from clients through the services to the data stores and the async notification pipeline.

```mermaid
flowchart LR
    subgraph Clients
        Web[Web app]
        Mobile[Mobile app]
    end
    subgraph Edge
        GW[API gateway]
    end
    subgraph Services
        Auth[Auth service]
        Orders[Orders service]
        Worker[Notifications worker]
    end
    subgraph Data
        PG[(Postgres)]
        Redis[(Redis)]
        Q[[Event queue]]
    end
    Email[/Email provider/]

    Web --> GW
    Mobile --> GW
    GW --> Auth
    GW --> Orders
    Orders --> PG
    Orders --> Redis
    Orders -.event.-> Q
    Q -.consume.-> Worker
    Worker --> Email
```

**Component legend**
- **API gateway** — single entry point; handles routing, rate limiting, and token validation with Auth.
- **Redis** — read cache + idempotency keys for the Orders service.
- **Event queue** — decouples order creation from notifications so a slow email provider never blocks checkout.

**Notes** — solid arrows are synchronous calls; dotted (`-.->`) are async events. Postgres is the single source of truth and a potential SPOF — worth a read replica. The third-party email provider is outside the trust boundary.
