import type { ReactNode } from "react";
import { Link } from "@/lib/router-compat";
import { SiteNav, SiteFooter } from "@/components/site-nav";

export function StaticPage({
  sheet,
  title,
  subtitle,
  children,
}: {
  sheet: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteNav />
      <article className="static-page section">
        <Link to="/" className="static-back">
          ← Back to home
        </Link>
        <div className="sheet-head">
          <span className="sheet-no">{sheet}</span>
        </div>
        <h1 className="static-title">{title}</h1>
        <p className="static-subtitle">{subtitle}</p>
        <div className="static-body">{children}</div>
      </article>
      <SiteFooter />
    </>
  );
}
