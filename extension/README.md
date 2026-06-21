# 🧩 PM Skills — Browser Extension

Insert any of the **198 professional Agent Skills** straight into the **ChatGPT**, **Claude.ai**, or **Gemini** chat box. No copy-paste, no switching tabs — pick a skill, it drops the framework into your message, you add your task and send.

![works on ChatGPT, Claude.ai, Gemini](https://img.shields.io/badge/works%20on-ChatGPT%20·%20Claude.ai%20·%20Gemini-d97757)

## What it does

- Adds a floating **🧠 Skills** button on chatgpt.com, claude.ai, and gemini.google.com.
- Click it → search **198 skills** (PRD, launch plan, postmortem, rubric, contract review, runway planner…).
- Pick one → its full framework is inserted into the chat input, prefixed above whatever you've already typed.
- 100% local. Skills are **bundled with the extension** — nothing is sent to any server. No login, no API key.

## Install (unpacked — while it's pre–Web Store)

1. Download/clone this repo.
2. Go to `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
3. Click **Load unpacked** and select this `extension/` folder.
4. Open ChatGPT / Claude.ai / Gemini — you'll see the **🧠 Skills** button bottom-right.

Works in any Chromium browser (Chrome, Edge, Brave, Arc). A packaged Chrome Web Store / Edge Add-ons listing is on the way.

## Keeping skills up to date

The extension ships a snapshot of the catalog at `extension/skills.json`. To refresh it after skills change:

```bash
node web/build-skills.mjs      # regenerate the canonical catalog
node extension/sync-skills.mjs # copy it into the extension
```

## Privacy

The extension requests only the `storage` permission and runs solely on the three chat sites listed in `manifest.json`. It reads no page content beyond the message box it writes into, makes **no network requests**, and collects nothing. The skills are static instruction files.

## Prefer not to install anything?

Every skill also runs in the browser at the **[Playground](https://mohitagw15856.github.io/pm-claude-skills/)** (your own Claude key) or copies as a ready-made ChatGPT/Gemini prompt.
