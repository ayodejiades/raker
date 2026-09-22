# The One Hard Thing: making three sponsor components do real work together

## 1. The problem

Raker's whole value proposition is a three-sponsor pipeline: Firecrawl discovers settlements, Convex stores and live-syncs them, AgentMail files claims and tracks replies. If any link is decorative, the product is a demo-page with a spreadsheet. The hard thing was that none of the three integrations worked as documented — each had to be debugged against the actually-published packages.

## 2. What broke and what we did

**Firecrawl's model output is shape-unstable.** The JSON extraction format lets the model choose its own top-level key and field names, so `convex/crawl.ts` `onCrawlComplete` accepts `settlements` or `listings`, a bare array, or a single object, plus `provider`/`providerName`/`company` aliases — and scrubs `TBD`/`N/A`-style placeholder strings into missing values instead of storing them literally.

**AgentMail's shipped client disagrees with its README.** `createInbox`/`listInboxes`/`getInbox` and the thread/message readers need an *action* context, not a mutation; `listCachedInboxes`/`getCachedInbox` exist only as component-level functions. `convex/inbox.ts` was rewritten to provision through AgentMail's REST API directly, and the frontend provisions via `useAction`.

**Reply-matching without a reliable thread id.** Settlement administrators reply from their own systems, so `convex/email.ts` matches inbound mail by `threadId` and falls back to the oldest still-unanswered claim on that inbox, linking the thread for subsequent replies. Status classification (`confirmed`/`denied`/`needs_info`) is keyword-based and deliberately conservative — anything unrecognized becomes `needs_info`, never a false confirmation.

**The missing static-hosting half.** The component was mounted but its upload API was never exposed and its HTTP routes never registered, so `convex.site` served nothing. Adding `convex/staticHosting.ts` (`exposeUploadApi`) and `registerStaticRoutes` in `convex/http.ts` took the site from a blank shell to a 200 with the working dashboard.

## 3. Failure handling

`currentInbox` never throws — a failed lookup returns `null` and the dashboard still renders with the provision button (`convex/inbox.ts`). Without that guard, one failed query blanked the entire page because `useQuery` has no error state here.
