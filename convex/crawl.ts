import { v } from "convex/values";
import { FirecrawlClient } from "@firecrawl/firecrawl-convex";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { components, internal } from "./_generated/api";

const firecrawl = new FirecrawlClient(components.firecrawl);

// Kick off a durable crawl of a settlement-tracker source (e.g. a class-action
// listing site). Pages stream into Firecrawl's own table as they're fetched;
// onCrawlComplete below turns them into rows in our `settlements` table.
export const crawlSource = action({
  args: { sourceId: v.id("sources") },
  handler: async (ctx, { sourceId }) => {
    const source = await ctx.runQuery(internal.crawl.getSource, { sourceId });
    if (!source) throw new Error("Unknown source");

    const { crawlId } = await firecrawl.startCrawl(ctx, {
      url: source.url,
      options: {
        limit: 50,
        scrapeOptions: {
          formats: [
            "markdown",
            {
              type: "json",
              prompt:
                "Extract each open settlement/claim listing on this page: title, " +
                "provider/company name, category, one-sentence eligibility summary, " +
                "claim deadline (if stated), and the settlement administrator's " +
                "contact email (if listed).",
            },
          ],
          onlyMainContent: true,
        },
      },
      onComplete: internal.crawl.onCrawlComplete,
      context: { sourceId },
    });

    await ctx.runMutation(internal.crawl.recordCrawlStart, { sourceId, crawlId });
    return { crawlId };
  },
});

export const getSource = internalMutation({
  args: { sourceId: v.id("sources") },
  handler: (ctx, { sourceId }) => ctx.db.get(sourceId),
});

export const recordCrawlStart = internalMutation({
  args: { sourceId: v.id("sources"), crawlId: v.string() },
  handler: (ctx, { sourceId, crawlId }) =>
    ctx.db.patch(sourceId, { lastCrawlId: crawlId, lastCheckedAt: Date.now() }),
});

export const onCrawlComplete = internalMutation({
  args: {
    crawlId: v.string(),
    jobId: v.optional(v.string()),
    status: v.union(
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    pageCount: v.number(),
    unstored: v.optional(v.number()),
    error: v.optional(v.string()),
    context: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    if (args.status !== "completed") return;

    const pages = await ctx.runQuery(components.firecrawl.lib.listPages, {
      crawlId: args.crawlId,
      paginationOpts: { numItems: 100, cursor: null },
    });

    for (const page of pages.page) {
      const extracted = page.json as
        | { listings?: Array<Record<string, string>> }
        | undefined;
      for (const listing of extracted?.listings ?? []) {
        if (!listing.title || !listing.provider) continue;
        await ctx.db.insert("settlements", {
          title: listing.title,
          provider: listing.provider,
          category: listing.category ?? "uncategorized",
          url: page.url,
          eligibilitySummary: listing.eligibilitySummary ?? "",
          claimDeadline: listing.claimDeadline,
          contactEmail: listing.contactEmail,
          sourceUrl: page.url,
          discoveredAt: Date.now(),
        });
      }
    }
  },
});

export const listSources = query({
  args: {},
  handler: (ctx) => ctx.db.query("sources").collect(),
});

export const addSource = mutation({
  args: { name: v.string(), url: v.string() },
  handler: (ctx, args) => ctx.db.insert("sources", args),
});
