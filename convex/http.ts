import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { agentmail } from "./email";

const http = httpRouter();

// Register this exact URL with AgentMail:
//   https://<your-deployment>.convex.site/agentmail/webhook
http.route({
  path: "/agentmail/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => agentmail.handleWebhook(ctx, req)),
});

// The Firecrawl component mounts its own /firecrawl/webhook route itself
// (see convex.config.ts httpPrefix) — nothing to add here for that.

export default http;
