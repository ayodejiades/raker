import { v } from "convex/values";
import { FirecrawlClient } from "@firecrawl/firecrawl-convex";
import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";

const firecrawl = new FirecrawlClient(components.firecrawl);

// TEMPORARY: seed a synthetic settlement addressed to our own test email so
// fileClaim has a real recipient. Delete the row after the loop test.
export const seedTestSettlement = mutation({
  args: { contactEmail: v.string() },
  handler: async (ctx, { contactEmail }) =>
    ctx.db.insert("settlements", {
      title: "[TEST] Raker claim-loop verification",
      provider: "Raker self-test",
      category: "test",
      url: "https://example.com/test-settlement",
      eligibilitySummary: "Synthetic row for end-to-end claim test; delete after.",
      contactEmail,
      sourceUrl: "self-test",
      discoveredAt: Date.now(),
    }),
});
export const dedupeSettlements = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("settlements").collect();
    const seen = new Set<string>();
    let deleted = 0;
    for (const s of all) {
      if (seen.has(s.title)) {
        await ctx.db.delete(s._id);
        deleted++;
      } else {
        seen.add(s.title);
      }
    }
    return { total: all.length, deleted, kept: seen.size };
  },
});

export const crawlStatus = query({
  args: { crawlId: v.string() },
  handler: async (ctx, { crawlId }) => {
    const crawl = await firecrawl.getCrawl(ctx, crawlId);
    const pages = await firecrawl.listPages(ctx, {
      crawlId,
      paginationOpts: { numItems: 3, cursor: null },
    });
    return {
      crawl,
      pageCount: pages.page.length,
      isDone: pages.isDone,
      sample: pages.page.map((p) => ({
        url: p.url,
        jsonKeys:
          p.json && typeof p.json === "object"
            ? Object.keys(p.json as Record<string, unknown>)
            : typeof p.json,
        jsonPreview: JSON.stringify(p.json)?.slice(0, 500),
        hasMarkdown: !!p.markdown,
        metadata: p.metadata,
      })),
    };
  },
});
