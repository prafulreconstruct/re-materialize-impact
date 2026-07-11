import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/dashboard/buyer/")({
  component: BuyerOverview,
});

function BuyerOverview() {
  const { state, currentUser } = useApp();
  const cart = state.cart[currentUser!.id] ?? [];
  const myInterests = state.interests.filter((i) => i.buyerId === currentUser!.id);
  const purchases = state.purchases.filter((p) => p.buyerId === currentUser!.id);
  const totalSpent = purchases.reduce((s, p) => s + p.price, 0);

  return (
    <>
      <div className="dash-head">
        <div>
          <div className="crumb">SHT 20 / BUYER · OVERVIEW</div>
          <h1>Your yard activity</h1>
        </div>
        <Link to="/browse" className="btn-mini primary">
          Browse the yard →
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-cell">
          <div className="stat-lbl">In cart</div>
          <div className="stat-val">{cart.length}</div>
          <div className="stat-sub">
            <Link to="/dashboard/buyer/cart">View saved items →</Link>
          </div>
        </div>
        <div className="stat-cell">
          <div className="stat-lbl">Quotes sent</div>
          <div className="stat-val">{myInterests.length}</div>
          <div className="stat-sub">
            {myInterests.filter((i) => i.status === "pending").length} pending
          </div>
        </div>
        <div className="stat-cell">
          <div className="stat-lbl">Accepted</div>
          <div className="stat-val">
            {myInterests.filter((i) => i.status === "accepted").length}
          </div>
          <div className="stat-sub">Open chats</div>
        </div>
        <div className="stat-cell">
          <div className="stat-lbl">Purchases</div>
          <div className="stat-val">{purchases.length}</div>
          <div className="stat-sub">Completed</div>
        </div>
        <div className="stat-cell">
          <div className="stat-lbl">Total spent</div>
          <div className="stat-val">
            ₹{(totalSpent / 1000).toFixed(1)}
            <em>k</em>
          </div>
          <div className="stat-sub">Lifetime</div>
        </div>
      </div>

      <div className="section-head">
        <h2>Recent quotes</h2>
        <Link to="/dashboard/buyer/interests" className="btn-mini">
          View all →
        </Link>
      </div>
      {myInterests.length === 0 ? (
        <div className="empty">
          <h3>No quotes sent yet</h3>
          <p>Browse the yard and tap "Show interest" on any listing.</p>
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
                <th>Your quote</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myInterests.slice(0, 5).map((i) => {
                const l = state.listings.find((x) => x.id === i.listingId);
                return (
                  <tr key={i.id}>
                    <td>{l?.name ?? "—"}</td>
                    <td className="mono">₹{i.quotePrice.toLocaleString("en-IN")}</td>
                    <td>
                      <span className={`pill ${i.status}`}>{i.status}</span>
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
