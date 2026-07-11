import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@/lib/router-compat";
import { SiteNav } from "@/components/site-nav";
import { DashSidebar, type DashSidebarItem } from "@/components/dash-sidebar";

export function DashboardShell({
  role,
  items,
  children,
}: {
  role: "buyer" | "seller";
  items: DashSidebarItem[];
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("dash-sidebar-open", sidebarOpen);
    return () => document.body.classList.remove("dash-sidebar-open");
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  return (
    <>
      <SiteNav />
      <div className="dash-wrap">
        {sidebarOpen ? (
          <button
            type="button"
            className="dash-overlay"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
        <DashSidebar
          role={role}
          items={items}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="dash-content">
          <div className="dash-topbar">
            <button
              type="button"
              className="dash-menu-btn"
              aria-expanded={sidebarOpen}
              aria-label="Open dashboard menu"
              onClick={() => setSidebarOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
            <span className="dash-topbar-label">
              {role === "seller" ? "Seller console" : "Buyer console"}
            </span>
          </div>
          <main className="dash-main">{children}</main>
        </div>
      </div>
    </>
  );
}
