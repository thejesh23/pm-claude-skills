# Skills Used by This Agent

The PM Launch Agent uses these skills from the main pm-claude-skills library:

| Skill | What it does | Used in step |
|---|---|---|
| [`go-to-market`](../../../skills/go-to-market/) | Generates the launch plan with positioning, messaging pillars, and key benefits | Step 3 |
| [`content-calendar`](../../../skills/content-calendar/) | Builds the scheduled content calendar across channels | Step 5 |
| [`media-pitch`](../../../skills/media-pitch/) | Drafts the media/journalist pitch (major and flagship launches only) | Step 6 |
| [`email-campaign`](../../../skills/email-campaign/) | Reference for email format used by the Channel Drafter subagent | (reference) |
| [`launch-checklist`](../../../skills/launch-checklist/) | Generates the phase-by-phase launch task checklist | Step 8 |

## How skills are referenced

This agent uses **symbolic links** to point to the canonical skill definitions in the main library. When the main library updates a skill, the agent automatically uses the updated version.

## Customising for your team's voice

The default skills produce neutral B2B SaaS positioning. If your brand voice is distinctive, consider forking the relevant skills:

```bash
cd templates/pm-launch-agent/skills/go-to-market
rm SKILL.md
cp /path/to/your/team/custom-go-to-market.md ./SKILL.md
```

Most teams customise `go-to-market` and `email-campaign` first — those are the skills with the most voice in the output.
