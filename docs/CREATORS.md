# 💼 The Creator Economy — publish skills, get paid, keep ownership

The registry lists your skills; this page is how it pays you. **You keep the repo, the customers, and ~95% of the money** — the Institute keeps the quality bar.

## How selling works (no marketplace middleman)

1. **Build a paid pack** — a private repo with your premium skills/benches, plus one public *sampler* skill in the [community registry](../community/README.md) so buyers can judge your craft.
2. **Sell access via Polar or Lemon Squeezy** (they handle payments, VAT, receipts — you keep ~95% minus their fees; this project takes **0%**). Your product is repo access: buyers get GitHub collaborator/team access via their built-in GitHub integration, then install with `npx pm-claude-skills install you/your-paid-repo`.
3. **List it**: add `"pricing": {"model": "paid", "checkout": "https://…"}` to your registry entry. CI validates the checkout URL is a real payment provider. Paid entries render with a 💼 mark — disclosed, never hidden.

## What the Institute enforces (why buyers trust the listing)

- Paid entries pass the **same security scan and SkillSpec grading** as everything else — money buys a listing field, never a pass.
- The **sampler rule**: every paid pack keeps at least one representative skill free and public. No sampler, no listing.
- Refund/abandonment: a paid entry whose repo 404s for buyers gets delisted immediately (the weekly registry re-scan already checks reachability).

## Pricing guidance (from watching this market)
Packs of 5-10 deep skills with references/templates sell in the $19-79 one-time range; niche vertical expertise (clinical, legal, regulated industries) supports more. Subscriptions only make sense if you genuinely update monthly — buyers can read your commit history, and they do.

## The demand signal is public
The [self-growing library pipeline](../scripts/) mines real requests for skills that don't exist yet — watch its issues for gaps, and build what people already asked for.
