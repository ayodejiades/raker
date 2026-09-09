import { v } from "convex/values";
import { AgentMail } from "@agentmail/convex";
import { components, internal } from "./_generated/api";
import { internalMutation, query } from "./_generated/server";

// onMessageReceived fires once per inbound message (settlement administrators
// replying to a claim email). This is the "AgentMail does real work" path:
// a reply lands here and the claim's status updates live for anyone watching
// the dashboard, no polling.
export const agentmail = new AgentMail(components.agentmail, {
  onMessageReceived: internal.email.onMessageReceived,
});

const CONFIRM_WORDS = ["confirm", "received", "approved", "eligible"];
const DENY_WORDS = ["deny", "denied", "ineligible", "not eligible"];

export const onMessageReceived = internalMutation({
  args: { message: v.any(), thread: v.any(), eventId: v.string() },
  handler: async (ctx, args) => {
    const threadId: string | undefined = args.message.thread_id;
    const inboxId: string | undefined = args.message.inbox_id;
    const body: string = (args.message.text ?? "").toLowerCase();

    let claim = threadId
      ? await ctx.db
          .query("claims")
          .filter((q) => q.eq(q.field("threadId"), threadId))
          .first()
      : null;

    if (!claim && inboxId) {
      // First reply on a thread we haven't linked yet: attach it to the
      // oldest still-unanswered claim from this inbox.
      claim = await ctx.db
        .query("claims")
        .filter((q) =>
          q.and(q.eq(q.field("inboxId"), inboxId), q.eq(q.field("status"), "sent")),
        )
        .first();
      if (claim) await ctx.db.patch(claim._id, { threadId });
    }
    if (!claim) return;

    const status = CONFIRM_WORDS.some((w) => body.includes(w))
      ? "confirmed"
      : DENY_WORDS.some((w) => body.includes(w))
        ? "denied"
        : "needs_info";

    await ctx.db.patch(claim._id, { status });
  },
});

export const listThread = query({
  args: { threadId: v.string() },
  handler: (ctx, { threadId }) =>
    ctx.runQuery(components.agentmail.lib.listInboundMessages, { threadId }),
});
