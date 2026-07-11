import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/static-page";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contact";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of use — RE/CONSTRUCT" },
      {
        name: "description",
        content: "Terms governing use of the RE/CONSTRUCT salvage marketplace in NCR.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <StaticPage
      sheet="SHT 91 / LEGAL · TERMS"
      title="Terms of use"
      subtitle="By using RE/CONSTRUCT you agree to these terms. Please read them before buying or listing materials."
    >
      <section>
        <h2>Platform role</h2>
        <p>
          RE/CONSTRUCT is a listing and matching platform for salvaged and surplus construction
          materials in the National Capital Region. We connect buyers and sellers but are not a
          party to offline pickup, payment, or site visits unless explicitly stated.
        </p>
      </section>
      <section>
        <h2>Seller responsibilities</h2>
        <p>
          Sellers must provide accurate descriptions, prices, locations, and material condition.
          Listings must represent legal surplus or demolition stock the seller is authorised to
          sell. Misleading listings may be removed and accounts suspended.
        </p>
      </section>
      <section>
        <h2>Buyer responsibilities</h2>
        <p>
          Buyers submit quotes in good faith. Accepted quotes open a chat thread for coordination.
          Buyers should inspect materials on site before final payment and transport. All local
          safety and building-code compliance is the buyer&apos;s responsibility.
        </p>
      </section>
      <section>
        <h2>Liability</h2>
        <p>
          Materials are sold &quot;as-is&quot; unless otherwise agreed in writing between parties.
          RE/CONSTRUCT is not liable for defects, quantity shortfalls, delays, or disputes arising
          from offline transactions.
        </p>
      </section>
      <section>
        <h2>Account conduct</h2>
        <p>
          Harassment, spam, fraudulent listings, or abuse of the messaging system may result in
          account termination. We may update these terms; continued use after changes constitutes
          acceptance.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Legal enquiries: <a href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</a>
        </p>
      </section>
    </StaticPage>
  );
}
