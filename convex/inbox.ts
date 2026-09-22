import { action, query } from "./_generated/server";

declare const process: { env: Record<string, string | undefined> };

const BASE = "https://api.agentmail.to/v0";

// The shipped @agentmail/convex client calls component *internal* functions
// (lib.createInbox) that app code cannot resolve, so inbox provisioning goes
// through AgentMail's REST API directly with the deployment's own key.
type RemoteInbox = {
  inbox_id: string;
  email: string;
  display_name?: string;
};

function key(): string {
  const k = process.env.AGENTMAIL_API_KEY;
  if (!k) throw new Error("AGENTMAIL_API_KEY is not set on this deployment");
  return k;
}

function normalize(inbox: RemoteInbox): { inboxId: string; email: string } {
  return { inboxId: inbox.inbox_id, email: inbox.email };
}

async function listRemote(): Promise<RemoteInbox[]> {
  const res = await fetch(`${BASE}/inboxes`, {
    headers: { Authorization: `Bearer ${key()}` },
  });
  if (!res.ok) throw new Error(`AgentMail list inboxes failed: ${res.status}`);
  const data = (await res.json()) as unknown;
  if (Array.isArray(data)) return data as RemoteInbox[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const k of ["inboxes", "data", "results"]) {
      if (Array.isArray(obj[k])) return obj[k] as RemoteInbox[];
    }
  }
  return [];
}

// Create the shared "claims filer" inbox on first use; otherwise return it.
export const provisionInbox = action({
  args: {},
  handler: async (): Promise<{ inboxId: string; email: string }> => {
    const existing = await listRemote();
    if (existing.length > 0) return normalize(existing[0]);
    const res = await fetch(`${BASE}/inboxes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: "raker-claims", display_name: "Raker" }),
    });
    if (!res.ok) throw new Error(`AgentMail create inbox failed: ${res.status}`);
    return normalize((await res.json()) as RemoteInbox);
  },
});

export const currentInbox = query({
  args: {},
  handler: async (): Promise<{ inboxId: string; email: string } | null> => {
    const existing = await listRemote();
    return existing.length > 0 ? normalize(existing[0]) : null;
  },
});
