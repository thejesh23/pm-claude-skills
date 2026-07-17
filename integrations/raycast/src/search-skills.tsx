import { ActionPanel, Action, List, Icon } from "@raycast/api";
import { useEffect, useState } from "react";

type Skill = { name: string; title: string; summary: string; plugin: string; instructions: string };
const BASE = "https://mohitagw15856.github.io/pm-claude-skills";

export default function Command() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${BASE}/skills.json`)
      .then((r) => r.json())
      .then((d) => { setSkills(d.skills); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  return (
    <List isLoading={loading} searchBarPlaceholder="What do you need to make? (PRD, postmortem, decode my lease…)">
      {skills.map((s) => (
        <List.Item
          key={s.name}
          icon={Icon.Document}
          title={s.title}
          subtitle={s.summary}
          accessories={[{ tag: s.plugin }]}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard title="Copy Skill (Paste into Any AI)" content={s.instructions} />
              <Action.OpenInBrowser title="Run in Playground" url={`${BASE}/index.html?skill=${s.name}`} />
              <Action.OpenInBrowser title="Open Skill Page" url={`${BASE}/skill/${s.name}.html`} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
