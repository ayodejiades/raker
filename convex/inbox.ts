import { AgentMail } from "@agentmail/convex";
import { components } from "./_generated/api";
import { action, query } from "./_generated/server";

const agentmail = new AgentMail(components.agentmail);

// This app sends and receives mail from one shared AgentMail inbox — the
// "claims filer" agent. Call this once (e.g. from the dashboard) to create it;
// createInbox caches it into the component's own `inboxes` table, so
// `currentInbox` below picks it up without another remote call.
export const provisionInbox = action({
  args: {},
  handler: async (ctx) => {
    const cached = await ctx.runQuery(components.agentmail.lib.listCachedInboxes, {});
    if (cached.length > 0) return cached[0];
    return await agentmail.createInbox(ctx, {
      username: "raker-claims",
      displayName: "Raker",
    });
  },
});

export const currentInbox = query({
  args: {},
  handler: async (ctx) => {
    const inboxes = await ctx.runQuery(components.agentmail.lib.listCachedInboxes, {});
    return inboxes[0] ?? null;
  },
});
