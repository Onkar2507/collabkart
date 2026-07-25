import { useEffect, useState } from "react";
import {
  NavLink,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";
import collabkartLogo from "../assets/collabkart-logo.png";

export default function Navbar() {
  const { user, role } = useAuth();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  // Pages where sidebar should never appear
  const authPages = ["/login", "/signup"];

  // Close mobile sidebar whenever route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent page scrolling while mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("mobile-menu-open");
    } else {
      document.body.classList.remove("mobile-menu-open");
    }

    return () => {
      document.body.classList.remove("mobile-menu-open");
    };
  }, [menuOpen]);

  if (!user || authPages.includes(location.pathname)) {
    return null;
  }

  const linkClass = ({ isActive }) =>
    `sidebar-link ${
      isActive ? "sidebar-link-active" : ""
    }`;

  return (
    <>
      {/* ================================
          MOBILE HEADER
      ================================= */}

      <header className="mobile-header">

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <span />
          <span />
          <span />
        </button>

        <div className="mobile-brand">
          <img
            src={collabkartLogo}
            alt="CollabKart"
            className="mobile-brand-image"
          />
        </div>

      </header>

      {/* ================================
          MOBILE OVERLAY
      ================================= */}

      <button
        type="button"
        className={`sidebar-overlay ${
          menuOpen ? "sidebar-overlay-open" : ""
        }`}
        onClick={() => setMenuOpen(false)}
        aria-label="Close navigation menu"
      />

      {/* ================================
          SIDEBAR
      ================================= */}

      <aside
        className={`sidebar ${
          menuOpen ? "sidebar-mobile-open" : ""
        }`}
      >

        {/* Sidebar Logo */}

        <div className="sidebar-brand">

          <img
            src={collabkartLogo}
            alt="CollabKart"
            className="sidebar-brand-image"
          />

          <button
            type="button"
            className="sidebar-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            ×
          </button>

        </div>

        {/* ================================
            NAVIGATION
        ================================= */}

        <div className="sidebar-section">

          <span className="sidebar-section-label">
            WORKSPACE
          </span>

          <nav className="sidebar-nav">

            {/* BRAND NAVIGATION */}

            {role === "brand" && (
              <>
                <NavLink
                  to="/dashboard/brand"
                  className={linkClass}
                >
                  <span className="sidebar-icon">
                    ⌂
                  </span>

                  Dashboard
                </NavLink>

                <NavLink
                  to="/influencers"
                  className={linkClass}
                >
                  <span className="sidebar-icon">
                    ◎
                  </span>

                  Discover Creators
                </NavLink>

                <NavLink
                  to="/matches"
                  className={linkClass}
                >
                  <span className="sidebar-icon">
                    ◇
                  </span>

                  Matches
                </NavLink>

                <NavLink
                  to="/my-requests"
                  className={linkClass}
                >
                  <span className="sidebar-icon">
                    ▣
                  </span>

                  My Requests
                </NavLink>

                <NavLink
                  to="/profile/brand"
                  className={linkClass}
                >
                  <span className="sidebar-icon">
                    ○
                  </span>

                  Brand Profile
                </NavLink>
              </>
            )}

            {/* CREATOR NAVIGATION */}

            {role === "influencer" && (
              <>
                <NavLink
                  to="/dashboard/influencer"
                  className={linkClass}
                >
                  <span className="sidebar-icon">
                    ⌂
                  </span>

                  Dashboard
                </NavLink>

                <NavLink
                  to="/incoming-requests"
                  className={linkClass}
                >
                  <span className="sidebar-icon">
                    ▣
                  </span>

                  Incoming Requests
                </NavLink>

                <NavLink
                  to="/profile/influencer"
                  className={linkClass}
                >
                  <span className="sidebar-icon">
                    ○
                  </span>

                  Influencer Profile
                </NavLink>
              </>
            )}

          </nav>

        </div>

        {/* ================================
            ACCOUNT FOOTER
        ================================= */}

        <div className="sidebar-footer">

          <div className="sidebar-account">

            <div className="sidebar-account-avatar">
              {role === "brand" ? "B" : "C"}
            </div>

            <div className="sidebar-account-info">

              <strong>
                {role === "brand"
                  ? "Brand account"
                  : "Creator account"}
              </strong>

              <span>
                {user.email}
              </span>

            </div>

          </div>

          <div className="sidebar-logout">
            <LogoutButton />
          </div>

        </div>

      </aside>
    </>
  );
}