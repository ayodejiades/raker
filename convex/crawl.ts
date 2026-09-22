import { v } from "convex/values";
import { FirecrawlClient } from "@firecrawl/firecrawl-convex";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
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
                "Extract each open settlement/claim listing on this page as JSON " +
                "in exactly this shape: " +
                '{"settlements": [{"title": string, "provider": string (company ' +
                "or defendant name), " +
                '"category": string, "eligibilitySummary": string (one sentence), ' +
                '"claimDeadline": string or omit, "contactEmail": string or omit}]}. ' +
                "Omit claimDeadline/contactEmail when the page does not state them " +
                "— never write TBD, N/A, or placeholder text.",
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

export const getSource = internalQuery({
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

    const pages = await firecrawl.listPages(ctx, {
      crawlId: args.crawlId,
      paginationOpts: { numItems: 100, cursor: null },
    });

    for (const page of pages.page) {
      // Firecrawl's JSON format lets the model choose the top-level key, so
      // accept `settlements` or `listings`, a bare array, or a single object.
      // Field names vary too (provider vs providerName, etc.).
      const raw = page.json as unknown;
      const candidates =
        Array.isArray(raw)
          ? raw
          : (((raw as Record<string, unknown> | undefined)?.settlements ??
              (raw as Record<string, unknown> | undefined)?.listings ??
              []) as Array<Record<string, unknown>>);
      const listings = Array.isArray(candidates) ? candidates : [candidates];
      for (const listing of listings) {
        if (typeof listing !== "object" || listing === null) continue;
        const title =
          (listing.title as string | undefined) ??
          (listing.name as string | undefined);
        const provider =
          (listing.provider as string | undefined) ??
          (listing.providerName as string | undefined) ??
          (listing.company as string | undefined);
        if (!title || !provider) continue;
        const existing = await ctx.db
          .query("settlements")
          .withIndex("by_title", (q) => q.eq("title", title))
          .first();
        if (existing) continue;
        // The model uses "TBD"/"N/A"-style placeholders when the page doesn't
        // state a value — store those as missing, not as literal strings.
        const clean = (v: unknown): string | undefined => {
          if (typeof v !== "string") return undefined;
          const t = v.trim();
          return t === "" ||
            /^(tbd|t\.b\.d\.|n\/a|unknown|none|not\s+(listed|stated|provided))$/i.test(
              t,
            )
            ? undefined
            : t;
        };
        await ctx.db.insert("settlements", {
          title,
          provider,
          category:
            (listing.category as string | undefined) ?? "uncategorized",
          url: page.url,
          eligibilitySummary:
            (listing.eligibilitySummary as string | undefined) ??
            (listing.eligibility as string | undefined) ??
            "",
          claimDeadline: clean(listing.claimDeadline),
          contactEmail: clean(listing.contactEmail),
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
