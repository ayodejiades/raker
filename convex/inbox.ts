import { AgentMail } from "@agentmail/convex";
import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";

const agentmail = new AgentMail(components.agentmail);

// This app sends and receives mail from one shared AgentMail inbox — the
// "claims filer" agent. Call this once (e.g. from the dashboard) to create it;
// later calls just return the cached one.
export const provisionInbox = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await agentmail.listCachedInboxes(ctx);
    if (existing.length > 0) return existing[0];
    return await agentmail.createInbox(ctx, {
      username: "settlement-hunter-claims",
      displayName: "Settlement Hunter",
    });
  },
});

export const currentInbox = query({
  args: {},
  handler: async (ctx) => {
    const inboxes = await agentmail.listCachedInboxes(ctx);
    return inboxes[0] ?? null;
  },
});
