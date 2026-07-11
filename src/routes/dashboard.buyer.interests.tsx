import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/dashboard/buyer/interests")({
  component: BuyerInterests,
});

function BuyerInterests() {
  const { state, currentUser, withdrawInterest } = useApp();
  const navigate = useNavigate();
  const mine = state.interests
    .filter((i) => i.buyerId === currentUser!.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      <div className="dash-head">
        <div>
          <div className="crumb">SHT 22 / BUYER · INTERESTS</div>
          <h1>My interests</h1>
        </div>
        <Link to="/browse" className="btn-mini">
          + Send another quote
        </Link>
      </div>

      {mine.length === 0 ? (
        <div className="empty">
          <h3>No quotes sent</h3>
          <p>Find materials in the yard and send a quote.</p>
          <Link to="/browse" className="btn-mini primary">
            Browse →
          </Link>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-tbl">
          <thead>
            <tr>
              <th>Listing</th>
              <th>Seller</th>
              <th>Your quote</th>
              <th>Delivery</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((i) => {
              const l = state.listings.find((x) => x.id === i.listingId);
              return (
                <tr key={i.id}>
                  <td>
                    {l?.name ?? "—"}
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                      asking ₹{l?.price.toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td>
                    {l?.sellerName}
                    {i.status === "accepted" && (
                      <div className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                        contact unlocked
                      </div>
                    )}
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
                        <button
                          className="btn-mini danger"
                          onClick={async () => {
                            try {
                              await withdrawInterest(i.id);
                            } catch (error) {
                              alert(
                                error instanceof Error
                                  ? error.message
                                  : "We couldn't withdraw that quote right now.",
                              );
                            }
                          }}
                        >
                          Withdraw
                        </button>
                      )}
                      {i.status === "accepted" && i.threadId && (
                        <button
                          className="btn-mini primary"
                          onClick={() =>
                            navigate({
                              to: "/dashboard/buyer/messages",
                              search: { t: i.threadId! },
                            })
                          }
                        >
                          Open chat →
                        </button>
                      )}
                    </div>
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
