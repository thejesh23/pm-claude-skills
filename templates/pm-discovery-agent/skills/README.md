# Skills Used by This Agent

The PM Discovery Agent uses these skills from the main pm-claude-skills library:

| Skill | What it does | Used in step |
|---|---|---|
| [`discovery-interview-guide`](../../../skills/discovery-interview-guide/) | Reference for what good discovery interviews look like (used by agent for context) | (reference) |
| [`user-interview-synthesis`](../../../skills/user-interview-synthesis/) | Drafts the structured discovery report from synthesised themes | Step 5 |
| [`job-story-mapper`](../../../skills/job-story-mapper/) | Converts themes into Jobs To Be Done format | Step 3 |
| [`assumption-mapper`](../../../skills/assumption-mapper/) | Reference for how to think about assumptions vs. validated findings | (reference) |

## How skills are referenced

This agent template uses **symbolic links** to point to the canonical skill definitions in the main library. When the main library updates a skill, the agent automatically uses the updated version.

## To use a custom version of a skill

If your team has a customised version of one of these skills, replace the symlink:

```bash
cd templates/pm-discovery-agent/skills/user-interview-synthesis
rm SKILL.md
cp /path/to/your/custom-synthesis.md ./SKILL.md
```

The agent will pick up the local version automatically.
