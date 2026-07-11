import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage } from "@/components/static-page";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — RE/CONSTRUCT" },
      {
        name: "description",
        content: "Get in touch with the RE/CONSTRUCT team for support, partnerships, or press.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <StaticPage
      sheet="SHT 93 / COMPANY · CONTACT"
      title="Contact us"
      subtitle="Questions about listings, accounts, or partnerships — we're here to help."
    >
      <section>
        <h2>General support</h2>
        <p>
          Email: <a href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</a>
          <br />
          Hours: Mon-Sat, 10:00-18:00 IST
        </p>
      </section>
      <section>
        <h2>Sellers</h2>
        <p>
          Want to list demolition or excess stock?{" "}
          <Link to="/signup?role=seller">Create a seller account →</Link> or write to{" "}
          <a href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</a>.
        </p>
      </section>
      <section>
        <h2>Buyers & NGOs</h2>
        <p>
          Browse coded inventory on <Link to="/browse">the yard</Link> or email{" "}
          <a href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</a> for bulk enquiries.
        </p>
      </section>
      <section>
        <h2>Office</h2>
        <p>
          RE/CONSTRUCT
          <br />
          Sector 62, Noida
          <br />
          Uttar Pradesh, India
        </p>
      </section>
    </StaticPage>
  );
}
