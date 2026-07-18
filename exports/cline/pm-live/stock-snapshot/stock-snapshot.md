# Stock Snapshot Skill

Stock prices are the live-data request with the highest stakes-to-availability mismatch: everyone asks, keyless *official* sources barely exist, and the standard keyless answer — Yahoo Finance's public chart endpoint — is unofficial, reshapeable, and possibly delayed. This skill uses it the only defensible way: clearly sourced, timestamped, delay-flagged, wrapped in the no-advice line, and honest that anything portfolio-grade belongs with a real brokerage feed. Within those fences, it's genuinely useful: quotes, day moves, and recent ranges in one curl.

## What This Skill Produces

- **The snapshot** — last price, day change, day range, volume — with its timestamp and delay flag
- **Context on request** — 52-week position, recent trend from the chart series (described, not extrapolated)
- **The command** — exact curl, rerunnable
- **The fences** — unofficial-source note and the no-advice line, every single time

## Required Inputs

Ask for these if not provided:
- **The ticker** — resolved carefully: company names map to multiple listings ("did you mean the NYSE or Frankfurt listing?"); exchange suffixes matter (`SAP.DE` vs `SAP`) and the wrong-listing answer is confidently wrong in the wrong currency
- **What they actually want** — a number, a day summary, or a range/history — shapes which fields get read
- **Why (lightly)** — curiosity gets the snapshot; anything that smells like a trading decision gets the snapshot *plus* the this-is-not-the-data-for-that sentence

## Framework: The Fetch and the Fences

1. **The call:** `curl -s -A "Mozilla/5.0" "https://query1.finance.yahoo.com/v8/finance/chart/AAPL?range=1d&interval=1d"` — the `meta` object carries `regularMarketPrice`, `previousClose`, `regularMarketTime` (epoch — convert and show), `currency`, `exchangeName`. History: `range=1mo&interval=1d` → the `timestamp` + `indicators.quote` arrays. **The User-Agent header is required** — without it the endpoint often refuses.
2. **Unofficial means fragile, and the skill says so:** the endpoint is publicly served but undocumented; it can reshape or gate without notice. On a weird response: report it, don't improvise a price. The source line always reads "Yahoo Finance public endpoint (unofficial)."
3. **Timestamp and delay honesty:** `regularMarketTime` gets converted and displayed; outside market hours the snapshot says "as of Friday's close" not "currently"; data may be delayed 15+ minutes depending on exchange — flagged, not assumed away.
4. **Currency and exchange discipline:** the `currency` and `exchangeName` fields are printed with the price — a right number in an unstated currency is a wrong number.
5. **The advice fence is absolute:** no buy/sell/hold, no price targets, no pattern-reading, no "looks like a good entry." "Should I buy?" gets the snapshot, the volatility fact, and the clean refusal — same posture as [crypto-prices](../crypto-prices/SKILL.md), because the reasons are identical.

## Output Format

# [Ticker] — [exchange, currency]

**[Price] · [±change, ±%] on the day** · as of [converted timestamp] ([market open / after close])

[Day range · volume · on request: 52-week position, the 1-month shape in one descriptive sentence]

Source: Yahoo Finance public endpoint (unofficial; may be delayed) · rerun: `[exact curl]`
*Informational snapshot, not investment advice or trading-grade data — decisions belong on a brokerage feed.*

## Quality Checks

- [ ] The ticker's exchange and currency are printed with the price
- [ ] The timestamp is converted and the open/closed state stated
- [ ] The unofficial-and-possibly-delayed line appears verbatim in spirit
- [ ] Weird responses are reported, never smoothed into a made-up price
- [ ] The no-advice fence held, including against indirect asks

## Anti-Patterns

- [ ] Do not answer prices from memory — a remembered stock price is historical fiction
- [ ] Do not resolve ambiguous tickers silently — the wrong listing is the classic confident error
- [ ] Do not describe chart history in predictive language — shapes are described, futures are not
- [ ] Do not present this endpoint as trading-grade — the fence is part of the answer
- [ ] Do not give investment advice under any phrasing — the refusal is the skill working
