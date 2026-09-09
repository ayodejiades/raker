# Bounty targeting — Convex All Gas Hackathon

## The one build that satisfies all three sponsors
Firecrawl continuously crawls settlement-tracker sites for new claim opportunities →
Convex stores/lives-syncs them and the claims pipeline → AgentMail's inbox sends the
claim-filing email and receives the administrator's reply, flipping claim status
live for anyone watching the dashboard.

## Sponsor mapping
| Sponsor | Required tech | Where it shows up here |
|---|---|---|
| Convex | queries, mutations, live sync, components | `convex/schema.ts` (settlements/claims/sources), reactive `settlements.list` + `claims.listForSettlement` queries driving the UI with no polling |
| Firecrawl | real crawl, not a one-shot scrape | `convex/crawl.ts` — durable `startCrawl` over settlement-tracker sources, JSON-mode extraction, `onComplete` writes rows |
| AgentMail | send + receive, not decoration | `convex/claims.ts` sends the claim email from the app's own inbox; `convex/email.ts` `onMessageReceived` ingests the administrator's reply and updates claim status live |

## Judging criteria self-check
- **Creativity/usefulness:** real person (anyone who's ever gotten a "you may be part of a class action" postcard) — not a dev tool.
- **Convex depth:** live dashboard, not a thin frontend on a hosted page.
- **Sponsor stack:** all three do the actual work described above, verifiable in code.
- **Live URL:** deploy via `@convex-dev/static-hosting` → `<deployment>.convex.site`.

## Not yet built (fill in as you go)
- [ ] Real crawl source list (currently empty `sources` table — add via `addSource` mutation)
- [ ] Better JSON-extraction prompt tuning once real settlement-tracker HTML is seen
- [ ] Auth (optional per rules — add only if multi-user matters for the demo)
