import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/dashboard/seller/")({
  component: SellerOverview,
});

function SellerOverview() {
  const { state, currentUser } = useApp();
  const myListings = state.listings.filter((l) => l.sellerId === currentUser!.id);
  const myInterests = state.interests.filter((i) => i.sellerId === currentUser!.id);
  const accepted = myInterests.filter((i) => i.status === "accepted").length;
  const pending = myInterests.filter((i) => i.status === "pending").length;
  const totalViews = myListings.reduce((sum, l) => sum + l.views, 0);
  const totalValueLive = myListings
    .filter((l) => l.status === "live")
    .reduce((s, l) => s + l.price, 0);

  return (
    <>
      <div className="dash-head">
        <div>
          <div className="crumb">SHT 10 / SELLER · OVERVIEW</div>
          <h1>Stats & analytics</h1>
        </div>
        <Link to="/dashboard/seller/listings" className="btn-mini primary">
          + Add listing
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-cell">
          <div className="stat-lbl">Active listings</div>
          <div className="stat-val">
            {myListings.filter((l) => l.status === "live").length}
            <em>/ {myListings.length}</em>
          </div>
          <div className="stat-sub">Live in the yard</div>
        </div>
        <div className="stat-cell">
          <div className="stat-lbl">Total views</div>
          <div className="stat-val">{totalViews}</div>
          <div className="stat-sub">Across all listings</div>
        </div>
        <div className="stat-cell">
          <div className="stat-lbl">Pending quotes</div>
          <div className="stat-val">{pending}</div>
          <div className="stat-sub">Awaiting response</div>
        </div>
        <div className="stat-cell">
          <div className="stat-lbl">Accepted deals</div>
          <div className="stat-val">{accepted}</div>
          <div className="stat-sub">In active conversation</div>
        </div>
        <div className="stat-cell">
          <div className="stat-lbl">Live inventory value</div>
          <div className="stat-val">
            ₹{(totalValueLive / 1000).toFixed(1)}
            <em>k</em>
          </div>
          <div className="stat-sub">Across active listings</div>
        </div>
      </div>

      <div className="section-head">
        <h2>Top listings by views</h2>
        <Link to="/dashboard/seller/listings" className="btn-mini">
          Manage all →
        </Link>
      </div>
      {myListings.length === 0 ? (
        <div className="empty">
          <h3>No listings yet</h3>
          <p>Add your first listing to start receiving buyer interest.</p>
          <Link to="/dashboard/seller/listings" className="btn-mini primary">
            + Add listing
          </Link>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-tbl">
          <thead>
            <tr>
              <th>Material</th>
              <th>Code</th>
              <th>Price</th>
              <th>Views</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[...myListings]
              .sort((a, b) => b.views - a.views)
              .slice(0, 5)
              .map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td className="mono">{l.catCode}</td>
                  <td className="mono">₹{l.price.toLocaleString("en-IN")}</td>
                  <td className="mono">{l.views}</td>
                  <td>
                    <span className={`pill ${l.status}`}>{l.status}</span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        </div>
      )}
    </>
  );
}
