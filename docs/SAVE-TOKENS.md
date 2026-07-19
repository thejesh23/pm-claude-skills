# 💸 Save Tokens — the practical guide

How to actually cut your AI bill with the [pm-tokens](../plugins/pm-tokens) bundle — as a Claude Code user, an API developer, or anyone whose agent burns money. Five habits, each with the copy-paste version.

**Install once:** `/plugin install pm-tokens@pm-skills` in Claude Code (or `npx pm-claude-skills add --agent claude` for everything). The skills then activate automatically when you ask for the things below — or run the scripts yourself; they're plain Python, no API keys, nothing leaves your machine.

## The one-minute mental model

Your bill = **(what's in context) × (price) × (every single turn)** + **(output) × (3–5× the input price)**.

So the levers, in order of impact: keep bulk *out* of context (crush it, map it, link it) · make output terse where nobody needs prose · keep the stable stuff byte-identical at the top (provider caches price cached prefix at ~10% of fresh) · measure before and after.

## Habit 1 — Map the repo, don't read it

The single biggest agent waste is exploration: reading ten files to find one, re-reading them next session.

```bash
python3 skills/repo-map/scripts/repo_map.py . --max-files 400
```

The map prints its own economics (typically **~3% of the cost of reading everything**). Then the discipline: *open only files whose names/symbols match the task.* In Claude Code, just say **"map the repo first, then open only what matches"** — the repo-map skill carries the rest.

## Habit 2 — Crush bulk before it enters context

Never paste 300 JSON rows, a full build log, or a huge API response raw. Crush it first:

```bash
python3 skills/context-crusher/scripts/context_crush.py --mode json --file response.json
python3 skills/context-crusher/scripts/context_crush.py --mode log --file build.log
some-command | python3 skills/context-crusher/scripts/context_crush.py --mode log
```

Uniform JSON compresses ~**98%** (schema + samples + computed stats); logs dedupe while **every error line is guaranteed to survive**. In a session: **"crush this before analyzing it."** The original stays on disk — fetch details only if they turn out to matter.

## Habit 3 — Put your assistant on a token diet (where it's safe)

Output tokens cost **3–5× input**, so terse output is the highest-leverage diet there is. Add one line to your prompt — or permanently to `CLAUDE.md` for work sessions:

> Respond at token-diet level 2: short declaratives, no filler, no hedges, no restating my question. Full grammar only where ambiguity threatens.

The honesty that makes it work: **don't** diet single-shot calls (the instruction costs more than it saves), and never ship level-3 telegraphese to humans — that just moves the cost from your bill to their brain. The [token-diet](../skills/token-diet/SKILL.md) skill knows the levels and the exceptions.

## Habit 4 — Lay out your context for the cache

Providers price *cached* prefix tokens at a fraction of fresh ones — but only while the prefix stays byte-identical. So:

- **Stable first, volatile last:** instructions, standing references, and the repo map at the top; changing files, timestamps, and history at the bottom. One volatile line at the top re-prices everything below it, every turn.
- **Audit your `CLAUDE.md`:** everything in it rides *every* call. Ask: "is this useful per-turn, or per-session?" Reference material should be a link/index, not a resident.
- Before a long session, ask: **"plan a context budget for this workflow"** — the [context-budget](../skills/context-budget/SKILL.md) skill produces the load/link/fetch allocation and the eviction order for when the window fills anyway.

## Habit 5 — Hand off, don't drag

When context is about to compact, or you're stopping for the day: **"write a session handoff."** The [session-handoff](../skills/session-handoff/SKILL.md) note carries decisions-with-reasons, live state, in-flight coordinates, and landmines at **~5% of transcript size** — so the next session resumes instead of re-deriving, and never re-litigates a decision whose reasoning survived.

## Habit 0 — Measure, or it's vibes

```bash
python3 skills/token-cost/scripts/token_cost.py --file CLAUDE.md --price-in 3 --calls 200
python3 skills/token-cost/scripts/token_cost.py --file big.json --compare crushed.json --price-in 3 --calls 200
```

The `--calls` flag is the whole insight: a 40% saving on something sent once is a rounding error; 8% on something riding every call is real money. Estimates carry a permanent ±15% label (they're heuristics, not a tokenizer) — plenty for worth-it decisions.

## A realistic day, priced

A coding session that (1) starts with a map instead of exploratory reads, (2) crushes two big tool outputs, (3) runs level-2 output, and (4) keeps `CLAUDE.md` stable for the cache typically cuts **30–60% of the session's token flow** — with zero information loss on the input side, because everything crushed is structural (computed, not paraphrased) and reversible (the originals stay fetchable).

*The whole bundle: [plugins/pm-tokens](../plugins/pm-tokens) — six skills, three stdlib scripts, deterministic, byte-exact-tested, MIT.*
