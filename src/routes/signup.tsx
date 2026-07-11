import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSearch } from "@/lib/router-compat";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { useApp, type Role } from "@/lib/store";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — RE/CONSTRUCT" }] }),
  component: Signup,
});

function Signup() {
  const { signup } = useApp();
  const navigate = useNavigate();
  const search = useSearch() as { role?: string };
  const [role, setRole] = useState<Role>(search.role === "seller" ? "seller" : "buyer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    gst: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (search.role === "seller") setRole("seller");
    if (search.role === "buyer") setRole("buyer");
  }, [search.role]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const result = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role,
        address: form.address,
        gst: form.gst,
      });
      if (result.needsEmailConfirmation) {
        alert("Your account has been created. Please confirm your email, then log in.");
        navigate({ to: "/login" });
        return;
      }
      navigate({ to: role === "seller" ? "/dashboard/seller" : "/dashboard/buyer" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "We couldn't create your account right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SiteNav />
      <div className="auth-wrap">
        <h1>Sign up</h1>
        <p className="auth-sub">// CHOOSE YOUR ROLE</p>

        <div className="role-toggle">
          <button
            className={role === "buyer" ? "active" : ""}
            onClick={() => setRole("buyer")}
            type="button"
          >
            Buyer
          </button>
          <button
            className={role === "seller" ? "active" : ""}
            onClick={() => setRole("seller")}
            type="button"
          >
            Seller
          </button>
        </div>

        <form className="form-box" onSubmit={submit}>
          <div className="f-field">
            <label className="f-label">Full name *</label>
            <input
              className="f-input"
              type="text"
              required
              value={form.name}
              onChange={set("name")}
            />
          </div>
          <div className="f-field">
            <label className="f-label">Email *</label>
            <input
              className="f-input"
              type="email"
              required
              value={form.email}
              onChange={set("email")}
            />
          </div>
          <div className="f-field">
            <label className="f-label">Password *</label>
            <input
              className="f-input"
              type="password"
              required
              value={form.password}
              onChange={set("password")}
            />
          </div>
          <div className="f-field">
            <label className="f-label">Phone {role === "seller" ? "*" : "(optional)"}</label>
            <input
              className="f-input"
              type="tel"
              placeholder="+91 98XXX XXXXX"
              required={role === "seller"}
              value={form.phone}
              onChange={set("phone")}
            />
          </div>

          {role === "seller" && (
            <>
              <div className="f-field">
                <label className="f-label">Site address *</label>
                <input
                  className="f-input"
                  type="text"
                  placeholder="Sector 62, Noida"
                  required
                  value={form.address}
                  onChange={set("address")}
                />
              </div>
              <div className="f-field">
                <label className="f-label">GST number (optional)</label>
                <input
                  className="f-input"
                  type="text"
                  placeholder="22AAAAA0000A1Z5"
                  value={form.gst}
                  onChange={set("gst")}
                />
              </div>
            </>
          )}

          <button className="f-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Creating account..."
              : `Create ${role === "seller" ? "seller" : "buyer"} account →`}
          </button>
        </form>

        <p className="auth-foot">
          Already on the yard? <Link to="/login">Log in →</Link>
          {" · "}
          <Link to="/privacy">Privacy</Link>
          {" · "}
          <Link to="/terms">Terms</Link>
        </p>
      </div>
      <SiteFooter />
    </>
  );
}
