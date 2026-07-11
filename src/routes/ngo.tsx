import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { StaticPage } from "@/components/static-page";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/contact";

export const Route = createFileRoute("/ngo")({
  head: () => ({
    meta: [
      { title: "NGO Programme — RE/CONSTRUCT" },
      {
        name: "description",
        content:
          "Priority access to salvaged and surplus building materials for verified NGOs and community builders across NCR.",
      },
    ],
  }),
  component: NgoPage,
});

function NgoPage() {
  const [form, setForm] = useState({
    organisation: "",
    contactPerson: "",
    email: "",
    phone: "",
    categories: "",
    projects: "",
  });

  const updateField =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const body = [
      "NGO programme application",
      "",
      `Organisation name: ${form.organisation}`,
      `Contact person: ${form.contactPerson}`,
      `Email: ${form.email}`,
      `Phone / WhatsApp: ${form.phone}`,
      `Categories of interest: ${form.categories}`,
      "",
      "About your projects:",
      form.projects || "-",
    ].join("\n");

    window.location.href = `${SUPPORT_MAILTO}?subject=${encodeURIComponent("NGO programme application")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <StaticPage
      sheet="DRAWING 06 / COMMUNITY PROGRAMME"
      title="NGO programme"
      subtitle="Verified NGOs, community builders, and shelter projects across NCR can register for priority access to materials at cost."
    >
      <section>
        <p>
          Sellers who opt in donate their margin so good material reaches the projects that need it
          most.
        </p>
      </section>

      <section className="programme-steps">
        <div className="programme-step">
          <div className="static-step-no">01</div>
          <h2>Apply</h2>
          <p>Tell us about your organisation and the materials you typically need.</p>
        </div>
        <div className="programme-step">
          <div className="static-step-no">02</div>
          <h2>Get verified</h2>
          <p>
            We verify your registration and add you to the priority NGO list within 5 working days.
          </p>
        </div>
        <div className="programme-step">
          <div className="static-step-no">03</div>
          <h2>Source at cost</h2>
          <p>
            Get first look at relevant listings. Sellers who opt in waive their margin for verified
            NGOs.
          </p>
        </div>
      </section>

      <section>
        <form className="form-box programme-form" onSubmit={handleSubmit}>
          <div className="f-row">
            <div className="f-field">
              <label className="f-label" htmlFor="ngo-organisation">
                Organisation name
              </label>
              <input
                id="ngo-organisation"
                className="f-input"
                value={form.organisation}
                onChange={updateField("organisation")}
                required
              />
            </div>
            <div className="f-field">
              <label className="f-label" htmlFor="ngo-contact">
                Contact person
              </label>
              <input
                id="ngo-contact"
                className="f-input"
                value={form.contactPerson}
                onChange={updateField("contactPerson")}
                required
              />
            </div>
          </div>

          <div className="f-row">
            <div className="f-field">
              <label className="f-label" htmlFor="ngo-email">
                Email
              </label>
              <input
                id="ngo-email"
                type="email"
                className="f-input"
                value={form.email}
                onChange={updateField("email")}
                required
              />
            </div>
            <div className="f-field">
              <label className="f-label" htmlFor="ngo-phone">
                Phone / WhatsApp
              </label>
              <input
                id="ngo-phone"
                className="f-input"
                value={form.phone}
                onChange={updateField("phone")}
                required
              />
            </div>
          </div>

          <div className="f-field">
            <label className="f-label" htmlFor="ngo-categories">
              Categories of interest
            </label>
            <input
              id="ngo-categories"
              className="f-input"
              placeholder="e.g. Doors & Fixtures, Timber & Wood"
              value={form.categories}
              onChange={updateField("categories")}
              required
            />
          </div>

          <div className="f-field">
            <label className="f-label" htmlFor="ngo-projects">
              About your projects
            </label>
            <textarea
              id="ngo-projects"
              className="f-textarea"
              value={form.projects}
              onChange={updateField("projects")}
              required
            />
          </div>

          <button type="submit" className="f-submit">
            Submit application
          </button>
          <p className="f-note">
            Application opens in your email client and sends to {SUPPORT_EMAIL}.
          </p>
        </form>
      </section>
    </StaticPage>
  );
}
