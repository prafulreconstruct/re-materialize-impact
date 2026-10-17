import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { CatIcon } from "@/lib/listings-data";
import { useApp, type Listing } from "@/lib/store";
import { InterestDialog } from "@/components/interest-dialog";
import { ListingMedia } from "@/components/listing-media";

// Quotes received on the archived sold lots (closed before quotes were tracked in-app).
const SOLD_LOT_QUOTES = 13;

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { state } = useApp();
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<Listing | null>(null);
  const listings = state.listings.filter((l) => l.status === "live");
  const soldListings = state.listings.filter((l) => l.status === "sold");
  const shown = [...listings, ...soldListings];
  const visible = filter === "all" ? shown : shown.filter((l) => l.cat === filter);
  const soldIds = new Set(soldListings.map((l) => l.id));
  const platformPurchases = state.purchases.filter((p) => !soldIds.has(p.listingId));
  const soldCount = soldListings.length + platformPurchases.length;
  const quoteCount = SOLD_LOT_QUOTES + state.interests.length;
  const totalSavings =
    soldListings.reduce((sum, l) => sum + Math.max(l.market - l.price, 0), 0) +
    platformPurchases.reduce((sum, purchase) => {
      const listing = state.listings.find((item) => item.id === purchase.listingId);
      return sum + Math.max((listing?.market ?? purchase.price) - purchase.price, 0);
    }, 0);
  const tickerItems = listings.slice(0, 8);

  return (
    <>
      <SiteNav />

      <header className="hero">
        <div className="hero-sheet">SHT 00 / NCR SALVAGE EXCHANGE — NOIDA · GURUGRAM · DELHI</div>
        <h1>
          One site's <span className="strike">waste</span>
          <br />
          is another's <span className="or">foundation.</span>
        </h1>
        <div className="dimline hero-dim">
          <span className="tick" />
          <span className="rule" />
          <span className="lbl">EST. 2026 — BUILT IN NOIDA</span>
          <span className="rule" />
          <span className="tick" />
        </div>
        <p className="hero-sub">
          Doors, marble, steel, and timber — recovered from demolition and excess construction stock
          across NCR, verified and listed before they reach the landfill. Deal directly with the
          site. No middleman, no commission.
        </p>
        <div className="hero-actions">
          <Link to="/browse" className="btn btn-fill">
            Enter the yard →
          </Link>
          <Link to="/signup" className="btn btn-ghost">
            List your materials
          </Link>
        </div>
      </header>

      <div className="ticker-wrap" aria-hidden="true">
        <div className="ticker">
          {Array.from({ length: 2 }).flatMap((_, loopIndex) =>
            tickerItems.flatMap((listing, itemIndex) => [
              <span key={`listing-${loopIndex}-${itemIndex}`}>
                {listing.name} · {listing.loc}
              </span>,
              <span key={`sep-${loopIndex}-${itemIndex}`} className="sep">
                //
              </span>,
            ]),
          )}
        </div>
      </div>

      <section className="section">
        <div className="sheet-head">
          <span className="sheet-no">SHT 01 / MATERIAL SCHEDULE</span>
        </div>
        <h2>The index</h2>
        <p className="section-sub">
          Every listing is coded, verified, and categorised — the way a site engineer would log it.
        </p>
        <div className="index-grid">
          {state.categories.map((c) => {
            const count = listings.filter((l) => l.cat === c.key).length;
            return (
              <Link
                key={c.code}
                to={`/browse?cat=${encodeURIComponent(c.key)}`}
                className="index-cell"
              >
                <div className="index-code">{c.code}</div>
                <div className="index-icon">
                  <CatIcon kind={c.icon} />
                </div>
                <div className="index-name">{c.label}</div>
                <div className="index-count">{count} live</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 8 }}>
        <div className="sheet-head">
          <span className="sheet-no">SHT 02 / LIVE INVENTORY</span>
          <Link
            to="/browse"
            className="mono"
            style={{
              fontSize: 12,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "var(--orange)",
              textDecoration: "none",
            }}
          >
            Full yard →
          </Link>
        </div>
        <h2>In the yard now</h2>

        <div className="filter-row">
          <button
            className={`chip ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {state.categories.map((c) => (
            <button
              key={c.key}
              className={`chip ${filter === c.key ? "active" : ""}`}
              onClick={() => setFilter(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="cards">
          {visible.map((l) => (
            <div
              key={l.id}
              className={`rc-card ${l.status === "sold" ? "sold" : ""}`}
              style={{ cursor: "default" }}
            >
              <ListingMedia
                imageUrls={l.imageUrls}
                icon={l.icon}
                name={l.name}
                source={l.source}
                sold={l.status === "sold"}
              />
              <div className="card-body">
                <div className="card-cat">
                  {l.catCode} / {l.catLabel}
                </div>
                <div className="card-name">{l.name}</div>
                <div className="card-loc">{l.loc}</div>
                <div className="card-bottom">
                  <div>
                    <span className="price">₹{l.price.toLocaleString("en-IN")}</span>
                    <span className="price-old">mkt ₹{l.market.toLocaleString("en-IN")}</span>
                  </div>
                  {l.status === "sold" ? (
                    <button className="wa" disabled>
                      Sold
                    </button>
                  ) : (
                    <button className="wa" onClick={() => setActive(l)}>
                      Show interest
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {active && <InterestDialog listing={active} onClose={() => setActive(null)} />}

      <div className="logbook">
        <div className="logbook-inner">
          <div className="logbook-title">SITE LOGBOOK — RUNNING TOTALS</div>
          <div className="log-grid">
            <div>
              <div className="log-num">{listings.length}</div>
              <div className="log-lbl">Listings live</div>
            </div>
            <div>
              <div className="log-num">{soldCount}</div>
              <div className="log-lbl">Deals closed</div>
            </div>
            <div>
              <div className="log-num">{quoteCount}</div>
              <div className="log-lbl">Quotes submitted</div>
            </div>
            <div>
              <div className="log-num">
                ₹{(totalSavings / 100000).toFixed(1)}
                <em>L</em>
              </div>
              <div className="log-lbl">Saved vs market rate</div>
            </div>
          </div>
        </div>
      </div>

      <section className="section" id="process">
        <div className="sheet-head">
          <span className="sheet-no">SHT 03 / METHOD STATEMENT</span>
        </div>
        <h2>How the yard works</h2>
        <p className="section-sub">
          Three steps. No commission, no middleman — just a verified listing and a direct line to
          the site.
        </p>
        <div className="steps">
          <div className="step">
            <div className="step-no">01</div>
            <h3>The site lists it</h3>
            <p>
              A contractor or site manager submits photos, quantity, condition, and price — whether
              it's excess stock or salvage from a teardown.
            </p>
            <span className="mono-note">Verified within 24 hrs</span>
          </div>
          <div className="step">
            <div className="step-no">02</div>
            <h3>The buyer finds it</h3>
            <p>
              NGOs, homeowners, small builders, and designers browse the yard by material code and
              location across NCR.
            </p>
            <span className="mono-note">Filter by MAT code + sector</span>
          </div>
          <div className="step">
            <div className="step-no">03</div>
            <h3>Interest, then deal</h3>
            <p>
              Buyer submits a quotation and delivery preference. Seller approves; we email both
              sides with details to close the deal.
            </p>
            <span className="mono-note">0% commission, always</span>
          </div>
        </div>
      </section>

      <div className="ngo">
        <div className="ngo-inner">
          <div className="ngo-mark">NG</div>
          <div>
            <h3>Materials for community builders</h3>
            <p>
              We're opening a channel for NGOs and affordable-housing projects — salvaged materials
              at cost. If your organisation builds for communities in NCR, sign up as a buyer.
            </p>
          </div>
          <Link to="/signup" className="btn btn-ghost" style={{ flexShrink: 0 }}>
            Get in touch
          </Link>
        </div>
      </div>

      <div className="sell">
        <div className="sell-inner">
          <div>
            <div className="sell-eyebrow">FOR CONTRACTORS & SITE MANAGERS</div>
            <h2>Stop paying to dump what someone would pay to buy.</h2>
            <p className="sell-sub">
              Hauling debris costs money. Listing it earns money. Put your excess stock and salvage
              in front of buyers across NCR before the truck arrives.
            </p>
            <ul className="sell-points">
              <li>Free to list — 0% commission</li>
              <li>Live within 24 hours of verification</li>
              <li>Buyers send quotes directly through the platform</li>
              <li>You set the price, you close the deal</li>
            </ul>
            <Link to="/signup" className="btn-orange">
              Create a seller account →
            </Link>
          </div>
          <div className="form-box">
            <h3>// Seller workflow</h3>
            <div className="f-field">
              <label className="f-label">Step 1</label>
              <div className="f-input">Create your seller account</div>
            </div>
            <div className="f-field">
              <label className="f-label">Step 2</label>
              <div className="f-input">Add materials from your dashboard</div>
            </div>
            <div className="f-field">
              <label className="f-label">Step 3</label>
              <div className="f-input">Review buyer quotes and open chats</div>
            </div>
            <Link
              to="/signup"
              className="f-submit"
              style={{ display: "block", textAlign: "center", textDecoration: "none" }}
            >
              Create your seller account →
            </Link>
            <p className="f-note">Every listing is managed from your dashboard after sign-up</p>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
