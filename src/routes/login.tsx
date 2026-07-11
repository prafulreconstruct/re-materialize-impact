import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — RE/CONSTRUCT" }] }),
  component: Login,
});

function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsSubmitting(true);
      const user = await login(email, password);
      navigate({ to: user.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "We couldn't log you in right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SiteNav />
      <div className="auth-wrap">
        <h1>Log in</h1>
        <p className="auth-sub">// ACCESS YOUR YARD</p>

        <form className="form-box" onSubmit={submit}>
          <div className="f-field">
            <label className="f-label">Email</label>
            <input
              className="f-input"
              type="email"
              placeholder="you@site.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="f-field">
            <label className="f-label">Password</label>
            <input
              className="f-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="f-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in →"}
          </button>
        </form>
        <p className="auth-foot">
          New to the yard? <Link to="/signup">Sign up →</Link>
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
