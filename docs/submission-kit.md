# 📮 Submission kit — the distribution backlog, ready to click through

Everything below is prepared; each submission needs **your logged-in account** for the final clicks. Work top to bottom — ~45 minutes total.

## 1. Chrome Web Store (the extension, v1.1 with ambient Lint)

**Prepared:** `~/Desktop/pm-skills-extension-v1.1.0.zip` (fresh build of `extension/`, dev files excluded).

1. https://chrome.google.com/webstore/devconsole → your developer account ($5 one-time fee if not yet registered)
2. **New item** → upload the zip
3. Listing copy (paste-ready):
   - **Name:** PM Skills — Skill Picker & Writing Lint
   - **Summary (132 chars max):** Insert 441 professional AI skills into ChatGPT, Claude & Gemini — and lint your own writing against a skill's quality bar.
   - **Description:** Use the description section from [`extension/README.md`](../extension/README.md) (What it does + the Lint section).
   - **Category:** Productivity → Tools. **Language:** English.
4. **Privacy tab** (they will ask; honest answers):
   - Single purpose: "Insert professional writing frameworks into AI chat sites and lint user-selected text against quality checklists."
   - Permission justifications — `storage`: persists the user's own API key + preferences locally · `activeTab`/`scripting`: reads the user's current text selection only when the popup is opened · host `api.anthropic.com`: sends lint requests with the user's own key. **No analytics, no data collection** — say exactly that.
   - Remote code: none (all bundled).
5. Screenshots: 1280×800 — take two: the skill picker on chatgpt.com, and the Lint tab with verdicts. Submit for review (typically 1–3 days).

## 2. VS Code Marketplace

**Prepared:** `vscode-extension/pm-skills-0.1.0.vsix` (freshly packaged, verified).

1. https://marketplace.visualstudio.com/manage — publisher `mohitagw15856` (create it there if it doesn't exist yet; needs an Azure DevOps org + a Marketplace PAT with *Marketplace → Manage* scope)
2. Either upload the `.vsix` in the web UI (**New extension → Visual Studio Code**), or from the terminal:
   ```bash
   cd vscode-extension && npx @vscode/vsce login mohitagw15856 && npx @vscode/vsce publish
   ```
3. The README in `vscode-extension/` becomes the listing page automatically.

## 3. mcp.so

Form-based — https://mcp.so → **Submit**: paste the repo URL (`https://github.com/mohitagw15856/pm-claude-skills`) and the npm package (`pm-claude-skills-mcp`). It indexes from GitHub+npm, so the listing self-updates. While there, also check **PulseMCP** (pulsemcp.com → submit) — same two links.

## 4. Awesome-list PRs

Opened from your account by Claude (see the PR links in the session summary) — if any list maintainer requests format changes, the PRs are one-line edits.

## 5. After all four

Update the "Still to submit" section of [`OPERATIONS.md`](../OPERATIONS.md) — move the completed ones into the live-links table with their listing URLs.
