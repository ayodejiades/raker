import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Sites we continuously crawl for new/updated class-action & settlement listings.
  sources: defineTable({
    name: v.string(),
    url: v.string(),
    lastCrawlId: v.optional(v.string()),
    lastCheckedAt: v.optional(v.number()),
  }),

  // One row per settlement/claim opportunity discovered by a Firecrawl crawl.
  settlements: defineTable({
    title: v.string(),
    provider: v.string(), // e.g. "Rust-Oleum", "Equifax"
    category: v.string(), // e.g. "consumer product", "data breach", "employment"
    url: v.string(),
    eligibilitySummary: v.string(),
    claimDeadline: v.optional(v.string()),
    contactEmail: v.optional(v.string()), // settlement administrator's intake address
    sourceUrl: v.string(), // page this was crawled from
    discoveredAt: v.number(),
  }).index("by_provider", ["provider"]),

  // A user's decision to pursue a settlement, and the email thread that tracks it.
  claims: defineTable({
    settlementId: v.id("settlements"),
    userEmail: v.string(), // where we notify the human
    inboxId: v.string(), // this app's AgentMail inbox used to send/receive
    threadId: v.optional(v.string()),
    outboundId: v.optional(v.string()),
    status: v.union(
      v.literal("drafted"),
      v.literal("sent"),
      v.literal("confirmed"),
      v.literal("needs_info"),
      v.literal("denied"),
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_settlement", ["settlementId"]),
});
