# Community SkillBench results — bring your model

The benchmark isn't only ours to run. Any model with an OpenAI-compatible endpoint can be scored **by its own team, on their own key**, and published here:

1. **Fork** the repo. In your fork: Settings → Secrets → add `BYO_API_KEY` (your endpoint key), optionally `BYO_BASE_URL` (OpenAI-compatible base, default api.openai.com/v1), and `BYO_JUDGE_KEY` (an Anthropic key for the pinned judge — the judge model is fixed for comparability).
2. **Run** the "SkillBench (bring your model)" workflow in your fork with your model id. (~$1–5 of your inference.)
3. **PR** the produced `skillbench/community/<model>.json` here — the file embeds the public Actions run link, which is the provenance we review.

House rules: the task set and judge are pinned (that's what makes scores comparable) · results land labeled *community-submitted, self-run* · anything that games the judge gets removed with a public note. One PR = one model = one JSON file.
