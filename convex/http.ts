import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { agentmail } from "./email";

const http = httpRouter();

// Register this exact URL with AgentMail:
//   https://<your-deployment>.convex.site/agentmail/webhook
http.route({
  path: "/agentmail/webhook",
  method: "POST",
  // Cast: the component's RunMutationCtx type predates this convex version's
  // extra `runMutation` transactionLimits overload; ctx is structurally fine.
  handler: httpAction(async (ctx, req) =>
    agentmail.handleWebhook(
      ctx as unknown as Parameters<typeof agentmail.handleWebhook>[0],
      req,
    ),
  ),
});

// The Firecrawl component mounts its own /firecrawl/webhook route itself
// (see convex.config.ts httpPrefix) — nothing to add here for that.

export default http;
