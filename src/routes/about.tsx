import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/static-page";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — RE/CONSTRUCT" },
      {
        name: "description",
        content: "RE/CONSTRUCT is the salvage exchange for NCR construction — keeping good materials out of landfills.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <StaticPage
      sheet="SHT 92 / COMPANY · ABOUT"
      title="About RE/CONSTRUCT"
      subtitle="The salvage yard for NCR construction — verified listings, coded materials, and direct buyer–seller matching."
    >
      <section>
        <h2>What we do</h2>
        <p>
          RE/CONSTRUCT lists salvaged and surplus building materials from demolition sites and
          excess stock across Noida, Gurgaon, Delhi, and the wider NCR. Every listing is tagged with
          a MAT code so NGOs, builders, designers, and homeowners can find what they need quickly.
        </p>
      </section>
      <section>
        <h2>How it works</h2>
        <p>
          Sellers publish live inventory. Buyers browse the yard, submit quote interests, or add
          items to cart. When a seller accepts a quote, a chat opens to coordinate pickup and
          payment offline.
        </p>
      </section>
      <section>
        <h2>Get involved</h2>
        <p>
          <Link to="/browse">Browse the yard →</Link>
          {" · "}
          <Link to="/signup?role=seller">List as a seller →</Link>
          {" · "}
          <Link to="/contact">Contact the team →</Link>
        </p>
      </section>
    </StaticPage>
  );
}
