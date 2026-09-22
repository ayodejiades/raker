# Judge Evidence Matrix: Raker

Every claim below links to a verifiable artifact: source file, live URL, or command output.

## 1. Criterion → proof

| Judging criterion | Proof |
|---|---|
| Live, working product | https://vivid-toad-855.convex.site — dashboard renders settlements from the Convex backend, no polling (`src/App.tsx`, `convex/settlements.ts`) |
| Convex as real backend | `convex/schema.ts` (sources/settlements/claims tables); reactive `settlements.list` and `claims.listForSettlement` queries; five mounted components in `convex/convex.config.ts` |
| Firecrawl does real work | `convex/crawl.ts` — durable `startCrawl` over a settlement-tracker source, JSON-mode extraction prompt, `onComplete` writes `settlements` rows. 13 real rows extracted from Top Class Actions on the dev deployment (verified via `npx convex run settlements:list`) |
| AgentMail does real work | `convex/claims.ts` `fileClaim` sends from `raker-claims@agentmail.to`; prod claim `j571ar3aqbhw632xnzaayeg9bx8ex6cz` reached `sent` with a real `outboundId`. `convex/email.ts` `onMessageReceived` flips status on reply; webhook route in `convex/http.ts` |
| Demo video shows the real product | `docs/demo.mp4` (screen recording of the live site) + `docs/actions.json` step log |
| Bounty mapping | `docs/BOUNTIES.md` sponsor table; `SUBMISSION.md` sponsor tracks |

## 2. Verification commands

```bash
npm run typecheck          # frontend + backend typecheck, both pass
npx convex run settlements:list                    # crawled settlements
npx convex run crawl:listSources                   # seeded sources
curl -s -o /dev/null -w "%{http_code}\n" https://vivid-toad-855.convex.site  # 200
```

## 3. Known limitations (see also SUBMISSION.md)

No auth (single shared inbox, optional per rules). Extraction prompt tuned against Top Class Actions HTML only. Reply-matching falls back to oldest-unanswered-claim when no thread id is linked yet. Dashboard is desktop-first; error/loading states are minimal (`src/App.tsx`). Test settlement `[TEST] Raker claim-loop verification` should be deleted after the loop test.
