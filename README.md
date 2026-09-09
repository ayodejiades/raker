# Raker

Finds class-action / consumer settlements you qualify for, files the claim by
email, and tracks the administrator's reply live.

Built for the Convex All Gas Hackathon (Aug 25 – Sep 22, 2026).

## Stack
- **Backend:** Convex (schema, queries, mutations, HTTP actions)
- **Data feed:** [`@firecrawl/firecrawl-convex`](https://www.convex.dev/components/firecrawl/firecrawl-convex) — durable crawls of settlement-tracker sites
- **Email:** [`@agentmail/convex`](https://www.convex.dev/components/agentmail/convex) — sends claim-filing emails, ingests replies
- **Hosting:** [`@convex-dev/static-hosting`](https://www.npmjs.com/package/@convex-dev/static-hosting) → `<deployment>.convex.site`
- **Frontend:** React + Vite

## Setup

```bash
npm install
npx convex dev          # creates your dev deployment, generates convex/_generated
```

In another terminal, once the dev deployment exists:

```bash
npx convex env set FIRECRAWL_API_KEY fc-...
npx convex env set FIRECRAWL_WEBHOOK_SECRET whsec-...   # optional in dev (use mode: "poll" locally)
npx convex env set AGENTMAIL_API_KEY ...
npx convex env set AGENTMAIL_WEBHOOK_SECRET whsec-...

npm run dev:frontend
```

Register the AgentMail webhook URL (`https://<your-deployment>.convex.site/agentmail/webhook`)
in your AgentMail dashboard.

Seed a crawl source from the Convex dashboard or a script:

```ts
await ctx.runMutation(api.crawl.addSource, {
  name: "Top Class Actions",
  url: "https://example-settlement-tracker.com/open-claims",
});
```

Then trigger `api.crawl.crawlSource` with that source's id (use `mode: "poll"`
in local dev — Firecrawl's webhook can't reach `localhost`).

## Deploy

```bash
npm run build
npx convex deploy
npx @convex-dev/static-hosting deploy --dist dist
```

The live URL is `https://<your-deployment>.convex.site`.

## Build log
`/hackathon` (via the installed `convex-hackathon-skill`) keeps `hackathon.md`
current from the commits in this repo — run it after each work session.
