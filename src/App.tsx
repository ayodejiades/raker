import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";

export default function App() {
  const settlements = useQuery(api.settlements.list);
  const inbox = useQuery(api.inbox.currentInbox);
  const provisionInbox = useAction(api.inbox.provisionInbox);
  const fileClaim = useMutation(api.claims.fileClaim);
  const [userEmail, setUserEmail] = useState("");

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Raker</h1>
      <p>Live settlements discovered by Firecrawl. File a claim and watch the reply arrive.</p>

      {!inbox && (
        <button onClick={() => provisionInbox({})}>Provision claims inbox</button>
      )}
      {inbox && <p>Sending from: {inbox.email} ({inbox.inboxId})</p>}

      <input
        placeholder="your email for updates"
        value={userEmail}
        onChange={(e) => setUserEmail(e.target.value)}
        style={{ marginBottom: 16, display: "block" }}
      />

      <ul style={{ listStyle: "none", padding: 0 }}>
        {settlements === undefined && <li>Loading settlements…</li>}
        {settlements?.length === 0 && <li>No settlements found yet — run a crawl.</li>}
        {(settlements ?? []).map((s: Doc<"settlements">) => (
          <SettlementRow
            key={s._id}
            settlement={s}
            inboxId={inbox?.inboxId}
            userEmail={userEmail}
            onFile={(settlementId, inboxId) =>
              fileClaim({ settlementId, userEmail, inboxId })
            }
          />
        ))}
      </ul>
    </main>
  );
}

function SettlementRow({
  settlement,
  inboxId,
  userEmail,
  onFile,
}: {
  settlement: { _id: Id<"settlements">; title: string; provider: string; eligibilitySummary: string };
  inboxId?: string;
  userEmail: string;
  onFile: (settlementId: Id<"settlements">, inboxId: string) => void;
}) {
  const claims = useQuery(api.claims.listForSettlement, { settlementId: settlement._id });

  return (
    <li style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <strong>{settlement.title}</strong> — {settlement.provider}
      <p style={{ color: "#555" }}>{settlement.eligibilitySummary}</p>
      <button
        disabled={!inboxId || !userEmail}
        onClick={() => inboxId && onFile(settlement._id, inboxId)}
      >
        File claim
      </button>
      {(claims ?? []).map((c: Doc<"claims">) => (
        <div key={c._id} style={{ fontSize: 12, marginTop: 8 }}>
          status: <strong>{c.status}</strong>
        </div>
      ))}
    </li>
  );
}
