import { Link, useRouterState, useNavigate } from "@/lib/router-compat";
import { useApp } from "@/lib/store";

export type DashSidebarItem = { to: string; label: string; badge?: number; dot?: boolean };

export function DashSidebar({
  items,
  role,
  open,
  onClose,
}: {
  items: DashSidebarItem[];
  role: "buyer" | "seller";
  open: boolean;
  onClose: () => void;
}) {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className={`dash-side ${open ? "open" : ""}`}>
      <div className="dash-side-head">
        <div className="dash-side-head-row">
          <div className="dash-side-role">
            {role === "seller" ? "Seller console" : "Buyer console"}
          </div>
          <button type="button" className="dash-side-close" aria-label="Close menu" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="dash-side-name">{currentUser?.name ?? "Guest"}</div>
        <div className="dash-side-email">{currentUser?.email}</div>
      </div>
      <nav className="dash-nav">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className={pathname === it.to ? "active" : ""}
            onClick={onClose}
          >
            <span>{it.label}</span>
            {it.dot ? (
              <span className="badge badge-dot" aria-label="Unread" />
            ) : it.badge ? (
              <span className="badge">{it.badge}</span>
            ) : null}
          </Link>
        ))}
      </nav>
      <div className="dash-side-foot">
        <button
          className="dash-logout"
          onClick={async () => {
            try {
              await logout();
              navigate({ to: "/" });
            } catch (error) {
              alert(error instanceof Error ? error.message : "We couldn't log you out right now.");
            }
          }}
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
