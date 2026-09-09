import { v } from "convex/values";
import { AgentMail } from "@agentmail/convex";
import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";

const agentmail = new AgentMail(components.agentmail);

export const listForSettlement = query({
  args: { settlementId: v.id("settlements") },
  handler: (ctx, { settlementId }) =>
    ctx.db
      .query("claims")
      .withIndex("by_settlement", (q) => q.eq("settlementId", settlementId))
      .collect(),
});

// File a claim: draft + send the intake email to the settlement administrator
// from this app's AgentMail inbox, and record the claim so the UI can watch
// its status change live as replies arrive.
export const fileClaim = mutation({
  args: {
    settlementId: v.id("settlements"),
    userEmail: v.string(),
    inboxId: v.string(),
  },
  handler: async (ctx, { settlementId, userEmail, inboxId }) => {
    const settlement = await ctx.db.get(settlementId);
    if (!settlement) throw new Error("Unknown settlement");
    if (!settlement.contactEmail) {
      throw new Error("This settlement has no known intake email yet");
    }

    const claimId = await ctx.db.insert("claims", {
      settlementId,
      userEmail,
      inboxId,
      status: "drafted",
      createdAt: Date.now(),
    });

    const outboundId = await agentmail.sendMessage(ctx, inboxId, {
      to: settlement.contactEmail,
      subject: `Claim submission — ${settlement.title}`,
      text:
        `I would like to file a claim for the following settlement:\n\n` +
        `${settlement.title}\n${settlement.url}\n\n` +
        `Please confirm receipt and let me know if further information is needed.\n\n` +
        `Reply-to: ${userEmail}`,
      labels: ["claim-filing"],
    });

    await ctx.db.patch(claimId, { outboundId, status: "sent" });
    return claimId;
  },
});

export const markStatus = mutation({
  args: {
    claimId: v.id("claims"),
    status: v.union(
      v.literal("drafted"),
      v.literal("sent"),
      v.literal("confirmed"),
      v.literal("needs_info"),
      v.literal("denied"),
    ),
    notes: v.optional(v.string()),
  },
  handler: (ctx, { claimId, status, notes }) =>
    ctx.db.patch(claimId, { status, notes }),
});
