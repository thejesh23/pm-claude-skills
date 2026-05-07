# Skills Used by This Agent

The PM Stakeholder Communications Agent uses these skills from the main library, selecting one based on the audience:

| Skill | Used for audience | What it produces |
|---|---|---|
| [`executive-update`](../../../skills/executive-update/) | executive | Direct, decision-focused update for internal leadership |
| [`investor-update`](../../../skills/investor-update/) | investor | Metrics-led update with honest framing of wins and challenges |
| [`stakeholder-update`](../../../skills/stakeholder-update/) | stakeholder | Practical, operationally-focused update for cross-functional teams |
| [`board-deck-narrative`](../../../skills/board-deck-narrative/) | board | Strategic narrative with supporting evidence for board pre-reads |

The agent reads your `--audience` flag and routes to the appropriate skill. You don't need to choose the skill yourself.

## Custom skills for your team

If you want communications tailored to your specific format, fork the relevant skill into the `skills/` folder of this template and customise. Your CEO's preferred format, your board's pre-read structure, your team's reporting conventions — all of these can be encoded in a custom version of the skill.

```bash
cd templates/pm-stakeholder-comms-agent/skills/investor-update
rm SKILL.md
cp /path/to/your/team/custom-investor-update.md ./SKILL.md
```

The agent will use the local version automatically.
