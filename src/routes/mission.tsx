import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/static-page";

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title: "Mission — RE/CONSTRUCT" },
      {
        name: "description",
        content:
          "Why RE/CONSTRUCT exists: connect surplus and salvaged building materials with the people who can use them across NCR.",
      },
    ],
  }),
  component: MissionPage,
});

function MissionPage() {
  return (
    <StaticPage
      sheet="DRAWING 04 / STATEMENT OF INTENT"
      title="Build with what's already here."
      subtitle="RE/CONSTRUCT is a discovery layer for surplus and salvaged building materials across NCR."
    >
      <section className="static-numbered-section">
        <div className="static-step-no">01</div>
        <div>
          <h2>Problem</h2>
          <p>
            India generates an estimated 150 million tonnes of construction and demolition waste
            every year. Most of it never makes it to a recycler. It ends up dumped at the city edge,
            choking drains and burning at landfill sites. At the same time, sites a few kilometres
            away are buying virgin steel, marble, and timber at full retail prices.
          </p>
        </div>
      </section>

      <section className="static-numbered-section">
        <div className="static-step-no">02</div>
        <div>
          <h2>Approach</h2>
          <p>
            RE/CONSTRUCT is a discovery layer, not a logistics company. We do not store, ship, or
            sell materials. We connect the people who already have them with the people who need
            them. By keeping the marketplace lightweight and the transaction on WhatsApp, we stay
            out of the way of how the trade already works.
          </p>
        </div>
      </section>

      <section className="static-numbered-section">
        <div className="static-step-no">03</div>
        <div>
          <h2>Principles</h2>
          <div className="static-principles">
            <p>
              <strong>Free for sellers, always.</strong> Listing surplus or salvage costs nothing.
            </p>
            <p>
              <strong>No middleman pricing.</strong> Sellers set the price. We never mark up.
            </p>
            <p>
              <strong>Honest condition.</strong> Every listing shows condition, weight, dimensions,
              and pickup terms.
            </p>
            <p>
              <strong>NGO priority access.</strong> Community builders get materials at cost via our
              NGO programme.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>Help us close the loop</h2>
        <p>
          Whether you have material to list, a site to source from, or just want to spread the word.
        </p>
        <div className="static-cta-row">
          <Link to="/signup?role=seller" className="btn-mini primary">
            List a material
          </Link>
          <Link to="/browse" className="btn-mini">
            Browse the marketplace
          </Link>
        </div>
      </section>
    </StaticPage>
  );
}
