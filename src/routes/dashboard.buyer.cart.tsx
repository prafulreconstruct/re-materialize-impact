import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/dashboard/buyer/cart")({
  component: BuyerCart,
});

function BuyerCart() {
  const { state, currentUser, removeFromCart, checkoutCart } = useApp();
  const items = state.cart[currentUser!.id] ?? [];
  const enriched = items
    .map((it) => ({ it, listing: state.listings.find((l) => l.id === it.listingId)! }))
    .filter((x) => x.listing);
  const total = enriched.reduce((s, x) => s + x.listing.price, 0);

  return (
    <>
      <div className="dash-head">
        <div>
          <div className="crumb">SHT 21 / BUYER · CART</div>
          <h1>My cart</h1>
        </div>
        {enriched.length > 0 && (
          <button
            className="btn-mini primary"
            onClick={async () => {
              try {
                await checkoutCart();
                alert("Order placed. Check Purchases.");
              } catch (error) {
                alert(
                  error instanceof Error
                    ? error.message
                    : "We couldn't complete checkout right now.",
                );
              }
            }}
          >
            Checkout ₹{total.toLocaleString("en-IN")} →
          </button>
        )}
      </div>

      {enriched.length === 0 ? (
        <div className="empty">
          <h3>Your cart is empty</h3>
          <p>Add items from the yard to save them for later.</p>
          <Link to="/browse" className="btn-mini primary">
            Browse the yard →
          </Link>
        </div>
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-tbl">
          <thead>
            <tr>
              <th>Material</th>
              <th>Seller</th>
              <th>Location</th>
              <th>Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {enriched.map(({ it, listing }) => (
              <tr key={it.listingId}>
                <td>
                  {listing.name}
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
                    {listing.catCode}
                  </div>
                </td>
                <td>{listing.sellerName}</td>
                <td className="mono">{listing.loc}</td>
                <td className="mono">₹{listing.price.toLocaleString("en-IN")}</td>
                <td>
                  <button
                    className="btn-mini danger"
                    onClick={async () => {
                      try {
                        await removeFromCart(it.listingId);
                      } catch (error) {
                        alert(
                          error instanceof Error
                            ? error.message
                            : "We couldn't remove that item right now.",
                        );
                      }
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} className="mono" style={{ textAlign: "right", fontWeight: 600 }}>
                TOTAL
              </td>
              <td className="mono" style={{ fontWeight: 600 }}>
                ₹{total.toLocaleString("en-IN")}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
        </div>
      )}
    </>
  );
}
