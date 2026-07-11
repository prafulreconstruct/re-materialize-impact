import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/dashboard/buyer/purchases")({
  component: BuyerPurchases,
});

function BuyerPurchases() {
  const { state, currentUser } = useApp();
  const mine = state.purchases
    .filter((p) => p.buyerId === currentUser!.id)
    .sort((a, b) => b.date - a.date);
  const total = mine.reduce((s, p) => s + p.price, 0);

  return (
    <>
      <div className="dash-head">
        <div>
          <div className="crumb">SHT 23 / BUYER · PURCHASES</div>
          <h1>Purchase history</h1>
        </div>
        <span className="mono" style={{ color: "var(--ink-soft)", fontSize: 12 }}>
          Lifetime: ₹{total.toLocaleString("en-IN")}
        </span>
      </div>

      {mine.length === 0 ? (
        <div className="empty">
          <h3>No purchases yet</h3>
          <p>Items you check out from your cart will appear here.</p>
          <Link to="/dashboard/buyer/cart" className="btn-mini primary">
            View cart →
          </Link>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-tbl">
          <thead>
            <tr>
              <th>Order</th>
              <th>Material</th>
              <th>Date</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((p) => {
              const l = state.listings.find((x) => x.id === p.listingId);
              return (
                <tr key={p.id}>
                  <td className="mono">{p.id.slice(-6).toUpperCase()}</td>
                  <td>
                    {p.listingName || l?.name || "—"}
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                      {p.sellerName || l?.sellerName}
                    </div>
                  </td>
                  <td className="mono">{new Date(p.date).toLocaleDateString("en-IN")}</td>
                  <td className="mono">₹{p.price.toLocaleString("en-IN")}</td>
                  <td>
                    <span className="pill completed">{p.status}</span>
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
