import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@/lib/router-compat";
import { ListingMedia } from "@/components/listing-media";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { useApp, type Listing } from "@/lib/store";
import { InterestDialog } from "@/components/interest-dialog";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "The Yard — RE/CONSTRUCT" },
      {
        name: "description",
        content: "Browse live salvaged and surplus construction materials across NCR.",
      },
    ],
  }),
  component: Browse,
});

function Browse() {
  const { state, currentUser, addToCart } = useApp();
  const navigate = useNavigate();
  const search = useSearch() as { cat?: string };
  const [active, setActive] = useState<Listing | null>(null);

  const validCategoryKeys = useMemo(
    () => new Set(state.categories.map((category) => category.key)),
    [state.categories],
  );

  const filterFromUrl = search.cat && validCategoryKeys.has(search.cat) ? search.cat : "all";

  const [filter, setFilter] = useState(filterFromUrl);

  useEffect(() => {
    setFilter(filterFromUrl);
  }, [filterFromUrl]);

  const setCategoryFilter = (cat: string) => {
    if (cat === "all") {
      navigate({ to: "/browse" });
      return;
    }
    navigate({ to: "/browse", search: { cat } });
  };

  const live = state.listings.filter((l) => l.status === "live");
  const visible = filter === "all" ? live : live.filter((l) => l.cat === filter);
  const myCart = currentUser ? (state.cart[currentUser.id] ?? []) : [];
  const activeCategory = state.categories.find((c) => c.key === filter);

  return (
    <>
      <SiteNav />
      <section className="section">
        <Link
          to="/"
          className="mono"
          style={{
            fontSize: 12,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: "var(--ink-soft)",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 24,
          }}
        >
          ← Back to site
        </Link>
        <div className="sheet-head">
          <span className="sheet-no">
            SHT 02 / {filter === "all" ? "FULL INVENTORY" : (activeCategory?.code ?? "FILTERED")}
          </span>
          {currentUser?.role === "buyer" ? (
            <Link
              to="/dashboard/buyer/cart"
              className="mono"
              style={{
                fontSize: 12,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "var(--orange)",
                textDecoration: "none",
              }}
            >
              View cart ({myCart.length}) →
            </Link>
          ) : null}
        </div>
        <h2>{filter === "all" ? "The yard" : (activeCategory?.label ?? "The yard")}</h2>
        <p className="section-sub">
          {filter === "all"
            ? 'Every listing verified and coded. Tap "Show interest" to submit a quote, or add to your cart.'
            : `Showing live ${activeCategory?.label.toLowerCase() ?? "materials"} — ${visible.length} listing${visible.length === 1 ? "" : "s"} in this MAT code.`}
        </p>

        <div className="filter-row">
          <button
            className={`chip ${filter === "all" ? "active" : ""}`}
            onClick={() => setCategoryFilter("all")}
          >
            All
          </button>
          {state.categories
            .filter((c) => c.key !== "other")
            .map((c) => (
              <button
                key={c.key}
                className={`chip ${filter === c.key ? "active" : ""}`}
                onClick={() => setCategoryFilter(c.key)}
              >
                {c.label}
              </button>
            ))}
        </div>

        <div className="cards">
          {visible.map((l) => {
            const inCart = myCart.some((c) => c.listingId === l.id);
            return (
              <div key={l.id} className="rc-card" onClick={() => navigate(`/listing/${l.id}`)}>
                <ListingMedia
                  imageUrls={l.imageUrls}
                  icon={l.icon}
                  name={l.name}
                  source={l.source}
                />
                <div className="card-body">
                  <div className="card-cat">
                    {l.catCode} / {l.catLabel}
                  </div>
                  <div className="card-name">{l.name}</div>
                  <div className="card-loc">
                    {l.loc} · {l.sellerName}
                  </div>
                  <div
                    className="card-bottom"
                    style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}
                  >
                    <div>
                      <span className="price">₹{l.price.toLocaleString("en-IN")}</span>
                      <span className="price-old">mkt ₹{l.market.toLocaleString("en-IN")}</span>
                    </div>
                    <div
                      style={{ display: "flex", gap: 6 }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button className="wa" style={{ flex: 1 }} onClick={() => setActive(l)}>
                        Show interest
                      </button>
                      {currentUser?.role !== "seller" && (
                        <button
                          className="btn-mini"
                          disabled={inCart || !currentUser}
                          onClick={async () => {
                            try {
                              await addToCart(l.id);
                            } catch (error) {
                              alert(
                                error instanceof Error
                                  ? error.message
                                  : "We couldn't add that item right now.",
                              );
                            }
                          }}
                          title={!currentUser ? "Log in to add to cart" : ""}
                        >
                          {inCart ? "✓ In cart" : "+ Cart"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {visible.length === 0 && (
          <div className="empty" style={{ marginTop: 24 }}>
            <h3>No listings in this category</h3>
            <p>
              {filter === "all" ? (
                "No live materials right now — check back soon."
              ) : (
                <>
                  Nothing live under {activeCategory?.code ?? "this code"} yet.{" "}
                  <button
                    type="button"
                    className="btn-mini"
                    style={{ marginTop: 10 }}
                    onClick={() => setCategoryFilter("all")}
                  >
                    View all listings
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </section>
      {active && <InterestDialog listing={active} onClose={() => setActive(null)} />}
      <SiteFooter />
    </>
  );
}
