import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/dashboard/seller/interests")({
  component: SellerInterests,
});

function SellerInterests() {
  const { state, currentUser, acceptInterest, rejectInterest } = useApp();
  const navigate = useNavigate();
  const mine = state.interests
    .filter((i) => i.sellerId === currentUser!.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      <div className="dash-head">
        <div>
          <div className="crumb">SHT 12 / SELLER · BUYER INTERESTS</div>
          <h1>Buyer interests</h1>
        </div>
        <span className="mono" style={{ color: "var(--ink-soft)", fontSize: 12 }}>
          {mine.filter((i) => i.status === "pending").length} pending
        </span>
      </div>

      {mine.length === 0 ? (
        <div className="empty">
          <h3>No interests yet</h3>
          <p>When a buyer sends a quote, it'll appear here.</p>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-tbl">
          <thead>
            <tr>
              <th>Buyer</th>
              <th>Listing</th>
              <th>Quote</th>
              <th>Delivery</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((i) => {
              const listing = state.listings.find((l) => l.id === i.listingId);
              return (
                <tr key={i.id}>
                  <td>
                    <div>{i.buyerName}</div>
                    {i.status !== "pending" && (
                      <div className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                        {i.buyerPhone}
                      </div>
                    )}
                  </td>
                  <td>
                    {listing?.name ?? "—"}
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                      asking ₹{listing?.price.toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td className="mono">
                    <strong>₹{i.quotePrice.toLocaleString("en-IN")}</strong>
                  </td>
                  <td className="mono" style={{ fontSize: 12 }}>
                    {i.deliveryPref}
                  </td>
                  <td>
                    <span className={`pill ${i.status}`}>{i.status}</span>
                  </td>
                  <td>
                    <div className="dash-actions">
                      {i.status === "pending" && (
                        <>
                          <button
                            className="btn-mini accept"
                            onClick={async () => {
                              try {
                                const tid = await acceptInterest(i.id);
                                if (tid)
                                  navigate({
                                    to: "/dashboard/seller/messages",
                                    search: { t: tid },
                                  });
                              } catch (error) {
                                alert(
                                  error instanceof Error
                                    ? error.message
                                    : "We couldn't accept that quote right now.",
                                );
                              }
                            }}
                          >
                            Accept
                          </button>
                          <button
                            className="btn-mini reject"
                            onClick={async () => {
                              try {
                                await rejectInterest(i.id);
                              } catch (error) {
                                alert(
                                  error instanceof Error
                                    ? error.message
                                    : "We couldn't reject that quote right now.",
                                );
                              }
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {i.status === "accepted" && i.threadId && (
                        <button
                          className="btn-mini primary"
                          onClick={() =>
                            navigate({
                              to: "/dashboard/seller/messages",
                              search: { t: i.threadId! },
                            })
                          }
                        >
                          Open chat →
                        </button>
                      )}
                    </div>
                    {i.note && (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: "var(--ink-soft)",
                          fontStyle: "italic",
                        }}
                      >
                        "{i.note}"
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
    </>
  );
}
