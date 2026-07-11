import { useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useApp } from "@/lib/store";
import { legalLinks, getYardLinks } from "@/lib/site-links";

export function SiteNav() {
  const { currentUser } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dashHref = currentUser?.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer";

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="rc-nav">
      <Link to="/" className="rc-logo" title="RE/CONSTRUCT home">
        RE<em>/</em>CONSTRUCT
      </Link>
      <button
        type="button"
        className="nav-burger"
        aria-expanded={menuOpen}
        aria-controls="mobile-nav"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <div className="rc-nav-r">
        <Link to="/browse" className="nav-link" title="Browse all salvaged materials">
          Browse the yard
        </Link>
        <Link to="/mission" className="nav-link" title="Read our mission">
          Mission
        </Link>
        <Link to="/ngo" className="nav-link" title="NGO priority access programme">
          NGO programme
        </Link>
        <Link to="/contact" className="nav-link" title="Contact RE/CONSTRUCT">
          Contact
        </Link>
        {currentUser ? (
          <Link
            to={dashHref}
            className="nav-btn"
            title={`${currentUser.role === "seller" ? "Seller" : "Buyer"} dashboard — ${currentUser.name}`}
          >
            {currentUser.name.split(" ")[0]}
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="nav-btn nav-btn-ghost"
              title="Access your buyer or seller account"
            >
              Log in
            </Link>
            <Link to="/signup" className="nav-btn" title="Create a free buyer or seller account">
              Sign up
            </Link>
          </>
        )}
      </div>
      <div id="mobile-nav" className={`rc-mobile-nav ${menuOpen ? "open" : ""}`}>
        <Link to="/browse" className="nav-mobile-item" onClick={closeMenu}>
          <span className="nav-mobile-label">Browse the yard</span>
          <span className="nav-mobile-desc">All live listings by MAT code</span>
        </Link>
        <Link to="/mission" className="nav-mobile-item" onClick={closeMenu}>
          <span className="nav-mobile-label">Mission</span>
          <span className="nav-mobile-desc">Statement of intent</span>
        </Link>
        <Link to="/ngo" className="nav-mobile-item" onClick={closeMenu}>
          <span className="nav-mobile-label">NGO programme</span>
          <span className="nav-mobile-desc">Priority access for verified organisations</span>
        </Link>
        <Link to="/contact" className="nav-mobile-item" onClick={closeMenu}>
          <span className="nav-mobile-label">Contact us</span>
          <span className="nav-mobile-desc">Support, partnerships, and enquiries</span>
        </Link>
        {currentUser ? (
          <Link
            to={dashHref}
            className="nav-btn"
            onClick={closeMenu}
            title={`${currentUser.role === "seller" ? "Seller" : "Buyer"} dashboard`}
          >
            {currentUser.name.split(" ")[0]}
          </Link>
        ) : (
          <>
            <Link to="/login" className="nav-btn nav-btn-ghost" onClick={closeMenu}>
              Log in
            </Link>
            <Link to="/signup" className="nav-btn" onClick={closeMenu}>
              Sign up free
            </Link>
          </>
        )}
        <div className="nav-mobile-legal">
          {legalLinks.map((link) => (
            <button
              key={link.to}
              type="button"
              className="nav-mobile-legal-link"
              onClick={() => {
                closeMenu();
                navigate(link.to);
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function FootLink({ to, label, desc }: { to: string; label: string; desc: string }) {
  return (
    <Link to={to} className="foot-link" title={desc}>
      <span className="foot-link-label">{label}</span>
      <span className="foot-link-desc">{desc}</span>
    </Link>
  );
}

export function SiteFooter() {
  const { currentUser, state } = useApp();
  const dashHref = currentUser?.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer";
  const yardLinks = getYardLinks(state.categories);

  return (
    <footer className="rc-footer">
      <div className="foot-inner">
        <div className="foot-brand">
          <Link to="/" className="foot-logo" title="Back to homepage">
            RE<em>/</em>CONSTRUCT
          </Link>
          <p className="foot-tag">
            The salvage exchange for NCR construction. Verified listings, coded materials, and
            direct buyer–seller matching — built to keep good materials out of landfills.
          </p>
        </div>
        <div className="foot-col">
          <h4>The yard</h4>
          {yardLinks.map((link) => (
            <FootLink key={link.to} {...link} />
          ))}
        </div>
        <div className="foot-col">
          <h4>Sellers</h4>
          <FootLink
            to="/signup?role=seller"
            label="Become a seller"
            desc="List demolition or excess stock"
          />
          <FootLink to="/login" label="Seller log in" desc="Access your seller console" />
          {currentUser?.role === "seller" ? (
            <FootLink to={dashHref} label="Seller dashboard" desc="Manage listings & quotes" />
          ) : null}
        </div>
        <div className="foot-col">
          <h4>Account</h4>
          {currentUser ? (
            <>
              <FootLink to={dashHref} label="My dashboard" desc="Overview, interests & messages" />
              <FootLink to="/browse" label="Browse materials" desc="Return to the yard" />
            </>
          ) : (
            <>
              <FootLink to="/login" label="Log in" desc="Buyer or seller account" />
              <FootLink to="/signup" label="Sign up" desc="Free buyer or seller registration" />
              <FootLink
                to="/signup?role=buyer"
                label="Join as buyer"
                desc="Quote on materials & chat sellers"
              />
            </>
          )}
        </div>
        <div className="foot-col">
          <h4>Company & legal</h4>
          {legalLinks.map((link) => (
            <FootLink key={link.to} {...link} />
          ))}
        </div>
      </div>
      <div className="foot-bottom">
        <div className="foot-legal-row">
          {legalLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="dimline">
          <span className="tick" />
          <span className="rule" />
          <span className="lbl">© 2026 RECONSTRUCT — DRAWN UP IN NOIDA</span>
          <span className="rule" />
          <span className="tick" />
        </div>
      </div>
    </footer>
  );
}
