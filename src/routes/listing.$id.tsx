import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { ListingMedia } from "@/components/listing-media";
import { InterestDialog } from "@/components/interest-dialog";
import { supabase } from "@/lib/supabase";
import {
  listingSelectWithImages,
  mapListing,
  useApp,
  type Listing,
  type RawListing,
} from "@/lib/store";

export const Route = createFileRoute("/listing/$id")({
  head: () => ({
    meta: [
      { title: "Listing — RE/CONSTRUCT" },
      {
        name: "description",
        content: "Salvaged and surplus construction material listed on RE/CONSTRUCT.",
      },
    ],
  }),
  component: ListingDetail,
});

type LoadState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error"; message: string }
  | { status: "ready"; listing: Listing };

function ListingDetail() {
  const { id = "" } = useParams();
  const { currentUser, state, addToCart } = useApp();
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [showInterest, setShowInterest] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoad({ status: "loading" });

    supabase
      .from("listings")
      .select(listingSelectWithImages)
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        // 22P02: the id in the URL isn't a valid uuid.
        if (error && error.code !== "22P02") {
          setLoad({ status: "error", message: error.message });
        } else if (!data) {
          setLoad({ status: "missing" });
        } else {
          setLoad({ status: "ready", listing: mapListing(data as unknown as RawListing) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (load.status === "ready") {
      document.title = `${load.listing.name} — RE/CONSTRUCT`;
    }
  }, [load]);

  return (
    <>
      <SiteNav />
      <section className="section">
        <Link to="/browse" className="mono detail-back">
          ← Back to the yard
        </Link>

        {load.status === "loading" && <p className="section-sub">Loading listing…</p>}

        {(load.status === "missing" || load.status === "error") && (
          <div className="empty">
            <h3>{load.status === "missing" ? "Listing not found" : "Couldn't load listing"}</h3>
            <p>
              {load.status === "missing"
                ? "This listing may have been removed by the seller."
                : load.message}
            </p>
          </div>
        )}

        {load.status === "ready" &&
          (() => {
            const l = load.listing;
            const isSold = l.status === "sold";
            const savings = Math.max(l.market - l.price, 0);
            const savingsPct = l.market > 0 ? Math.round((savings / l.market) * 100) : 0;
            const myCart = currentUser ? (state.cart[currentUser.id] ?? []) : [];
            const inCart = myCart.some((c) => c.listingId === l.id);

            return (
              <>
                <div className="sheet-head">
                  <span className="sheet-no">
                    SHT 04 / {l.catCode} / {isSold ? "SOLD LOT" : "LIVE LISTING"}
                  </span>
                </div>

                <div className={`detail-grid ${isSold ? "sold" : ""}`}>
                  {!isSold && (
                    <div className="detail-media">
                      <ListingMedia
                        imageUrls={l.imageUrls}
                        icon={l.icon}
                        name={l.name}
                        source={l.source}
                      />
                    </div>
                  )}

                  <div>
                    <div className="sold-card-head">
                      <div className="card-cat">
                        {l.catCode} / {l.catLabel}
                      </div>
                      {isSold && <span className="sold-tag inline">Sold</span>}
                    </div>
                    <h2>{l.name}</h2>

                    <div className="detail-price">
                      <span className="price">
                        {isSold ? "Sold for " : ""}₹{l.price.toLocaleString("en-IN")}
                      </span>
                      {l.market > 0 && (
                        <span className="price-old">mkt ₹{l.market.toLocaleString("en-IN")}</span>
                      )}
                      {savings > 0 && (
                        <span className="detail-save">
                          {isSold ? "Buyer saved" : "Save"} ₹{savings.toLocaleString("en-IN")} (
                          {savingsPct}%)
                        </span>
                      )}
                    </div>

                    {isSold ? (
                      <p className="detail-note">
                        This lot has been sold. Browse the yard for similar live listings.
                      </p>
                    ) : (
                      <div className="detail-actions">
                        <button className="wa" onClick={() => setShowInterest(true)}>
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
                    )}

                    <dl className="detail-specs">
                      <dt>Status</dt>
                      <dd>{isSold ? "Sold" : l.status === "paused" ? "Paused" : "Live"}</dd>
                      <dt>Category</dt>
                      <dd>{l.catLabel}</dd>
                      <dt>Source</dt>
                      <dd>{l.source}</dd>
                      <dt>Location</dt>
                      <dd>{l.loc}</dd>
                      <dt>Seller</dt>
                      <dd>{l.sellerName}</dd>
                      <dt>Listed on</dt>
                      <dd>
                        {new Date(l.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </dd>
                      <dt>Views</dt>
                      <dd>{l.views}</dd>
                    </dl>
                  </div>
                </div>

                <div className="detail-desc">
                  <div className="sheet-no">Description</div>
                  <p>{l.description}</p>
                </div>

                {showInterest && (
                  <InterestDialog listing={l} onClose={() => setShowInterest(false)} />
                )}
              </>
            );
          })()}
      </section>
      <SiteFooter />
    </>
  );
}
