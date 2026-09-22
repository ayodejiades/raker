# Raker — submission checklist

- [ ] Upload demo video and paste URL into `SUBMISSION.md` → `## Video URL`
- [ ] Register AgentMail webhook: `https://vivid-toad-855.convex.site/agentmail/webhook` with `AGENTMAIL_WEBHOOK_SECRET` (already set on prod)
- [ ] Reply to the live claim email (in `ayodejiadesegun20@gmail.com` inbox, from `raker-claims@agentmail.to`) to verify the inbound status flip end to end
- [ ] Post the build on X or LinkedIn, tagging @convex, @openai, @firecrawl, @agentmail
- [ ] Submit at https://vibeapps.dev/judging/convex-all-gas-hackathon-openai/submit (requires public repo + live URL — both ready)
- [ ] Optional: delete `[TEST] Raker claim-loop verification` settlement after loop test; trigger `crawlSource` on the prod source to backfill real settlements

Live URL: https://vivid-toad-855.convex.site
Repo: https://github.com/ayodejiades/raker (public, up to date)
