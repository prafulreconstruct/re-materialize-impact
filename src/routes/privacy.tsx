import { createFileRoute } from "@tanstack/react-router";
import { StaticPage } from "@/components/static-page";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contact";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — RE/CONSTRUCT" },
      {
        name: "description",
        content: "How RE/CONSTRUCT collects, uses, and protects your personal information.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <StaticPage
      sheet="SHT 90 / LEGAL · PRIVACY"
      title="Privacy policy"
      subtitle="Last updated 26 June 2026. This policy explains what we collect on RE/CONSTRUCT and how we use it."
    >
      <section>
        <h2>Information we collect</h2>
        <p>
          When you create an account we collect your name, email, phone number, and role (buyer or
          seller). Sellers may also provide a site address and GST number. We store messages,
          quotes, listings, and order history connected to your account.
        </p>
      </section>
      <section>
        <h2>How we use information</h2>
        <p>
          We use your data to operate the marketplace: listing materials, matching buyers and
          sellers, enabling chat after accepted quotes, and showing your dashboard activity. We do
          not sell your personal information to third parties.
        </p>
      </section>
      <section>
        <h2>Storage & security</h2>
        <p>
          Account and marketplace data is stored in Supabase (hosted infrastructure). Passwords are
          handled by our authentication provider and are not stored in plain text. You are
          responsible for keeping your login credentials secure.
        </p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>
          You may request correction of profile details from your dashboard or by contacting us. You
          may delete your account by reaching out to support; some transaction records may be
          retained where required for legal or dispute purposes.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Privacy questions: <a href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</a>
        </p>
      </section>
    </StaticPage>
  );
}
