---
aliases: ["ScienceScapes Journey Builder"]
tags: [pm-skills, skill]
skill: sciencescapes-journey
description: "Design and scaffold a new interactive visual journey (or a new stop) for the ScienceScapes open-source science education site. Use when asked to add a science concept to ScienceScapes, build a visual explainer journey, or create an interactive canvas lesson that works for both kids and adults. Produces a complete scroll-journey section: hand-rolled Canvas 2D visualization, interaction hint, layered Simple/Deeper explanations, and a fact chip — zero dependencies, reduced-motion and touch friendly."
---

# ScienceScapes Journey Builder

Build a new visual journey for [ScienceScapes](https://github.com/mohitagw15856/sciencescapes) — "visual journeys through science, for ages 5 to 95." Live site: https://mohitagw15856.github.io/sciencescapes/

## The one rule

Every contribution is judged by a single question: **would both a kid and a grandparent feel this?** Not read it — *feel* it. If an explanation needs prior knowledge, it belongs in the 🔭 Deeper tab. The 🌱 Simple tab must work for someone who has never heard of the topic.

## Required Inputs

Ask the user for these if not provided:
- **The concept** (e.g. gravity, entropy, waves)
- **The core "aha" moment** — the one thing the visitor should *feel* (e.g. "orbiting is falling and missing")
- **What the visitor does** — every stop must be interactive (drag, slide, click), never a passive animation
- Whether this is a **new journey page** or a **new stop** on an existing journey

## Structure of a stop

Each stop is a full-viewport `<section>` with this exact anatomy (copy the pattern from any section of `index.html`):

1. **Interactive canvas** — the thing you play with (`<canvas class="viz">` + descriptive `aria-label`)
2. **Hint line** — one sentence under the canvas saying what to try
3. **🌱 Simple tab** — ~2 short paragraphs, zero jargon, concrete imagery
4. **🔭 Deeper tab** — the real machinery (history, math, physics), still plain language
5. **Fact chip** — one memorable number or fact
6. A `--accent` color for the section, a rail dot, and a giant background watermark

## Hard constraints

- **Zero dependencies.** No frameworks, no build step, no npm. Must run by opening `index.html`.
- Hand-rolled Canvas 2D only. The engine in `js/main.js` provides: `scene()` (render loop + drag handling + visibility-gated rendering), `cubeVertices(n)` / `cubeEdges(n)` / `rotatePlane()` / `projectTo2D()` (n-dimensional math), `glowDot()` / `glowLine()` (glow rendering), `lerp` / `clamp`.
- Respect `prefers-reduced-motion` (check the `REDUCED_MOTION` flag), support touch (`touch-action: none` is set on `.viz`), stay smooth on a mid-range phone.
- No trackers, no cookies, no external calls (Google Fonts is the only exception).
- Dark cosmic theme; pick the section accent from a Tailwind-300-level pastel so it glows on `#050510`.

## Interaction design bar

The best existing stops to imitate:
- **1D**: dragging a bead that *cannot pass its neighbour* — the constraint IS the lesson
- **2D**: a sphere passing through Flatland shown as our-view + flatlander-view side by side
- **Spacetime**: a draggable NOW-plane slicing a block universe
- **4D**: a "▶ Build it" button that constructs the tesseract from a cube before your eyes

Design the interaction so the *physics/math constraint itself* is what the user bumps into. If the canvas would work as a looping GIF, the design is not done.

## Anti-Patterns

- **Passive animation** — if the visitor only watches, it's a video, not a journey. Redesign until the constraint is something they bump into with their own hands.
- **Jargon in the Simple tab** — "vector", "coordinate", "orthogonal" all belong in Deeper. Simple uses beads, noodles, shadows, hallways.
- **Adding a dependency** — no Three.js, no D3, no build step, ever. The zero-dependency constraint is the project's identity.
- **Explaining two ideas in one stop** — one stop = one "aha". If the explanation needs "and also…", split it into two stops (this is why time and the tesseract are separate sections).
- **Skipping verification** — always render the page and look at the new scene before committing; a syntactically valid canvas scene can still draw nothing.

## Workflow

1. Read the existing `index.html`, `css/style.css`, `js/main.js` to match patterns exactly.
2. Write the section HTML (rail dot + section + tabs), the scene in `main.js`, and any accent CSS.
3. Verify: `node --check js/main.js`, then render the page (headless screenshot or browser) and confirm the new scene draws.
4. Update README (stops table + roadmap checkbox) and keep CONTRIBUTING.md's rules satisfied.

## Output

A working, committed change to the ScienceScapes repo: new section + scene + README row — plus a one-paragraph summary of the "aha" moment and what the user does, suitable for the PR description.

---
<!-- Run as an AI-plugin prompt. {{selection}} is the Text Generator / Templater
     variable for the highlighted text — replace it with your plugin's equivalent
     (e.g. {} in Copilot for Obsidian), or paste your input there manually. -->
Apply the skill above to the following input:

{{selection}}
