# Raker — submission

## Title

Raker

## Tagline

Finds class-action settlements you qualify for and files claims by email

## Description

Raker crawls public settlement-tracker sites for open class-action settlements, shows them on a live dashboard, and files a claim by email on the user's behalf. The settlement administrator's reply arrives through the app's own inbox and flips the claim's status live. No polling, no manual form-filling — discover, file, and track in one place.

## Built with

Convex (queries, mutations, actions, HTTP actions, cron-ready pipeline), Firecrawl Convex component (durable crawl + JSON-mode extraction), AgentMail Convex component + REST (inbox provisioning, claim-filing send, reply webhook), React + Vite, @convex-dev/static-hosting

## Sponsor tracks

- Convex: `convex/schema.ts` (sources/settlements/claims), reactive `settlements.list` and `claims.listForSettlement` queries drive the dashboard with no polling; deployed backend + frontend to `convex.site` via static hosting.
- Firecrawl: `convex/crawl.ts` runs a durable `startCrawl` over settlement-tracker sources with a JSON extraction prompt; `onCrawlComplete` writes rows into `settlements` (13 real rows extracted from Top Class Actions).
- AgentMail: `convex/claims.ts` sends the claim email from the app's own inbox (`raker-claims@agentmail.to`); `convex/email.ts` `onMessageReceived` ingests the administrator's reply and updates claim status live; webhook at `/agentmail/webhook`.

## Video URL

<paste after upload>

## Repo URL

https://github.com/ayodejiades/raker

## Team

Ayodeji Adesegun (solo)

## What is not built

Auth (optional per rules — single shared claims inbox instead). The extraction prompt is tuned against Top Class Actions HTML only and may need iteration per source. Reply-matching falls back to oldest-unanswered-claim on the inbox when a thread id has not been linked yet. No mobile layout pass; desktop-first dashboard.
