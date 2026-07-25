import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user, role } = useAuth();

  const homePath = user
    ? role === "brand"
      ? "/dashboard/brand"
      : "/dashboard/influencer"
    : "/login";

  return (
    <main className="not-found-page">
      <div className="not-found-glow not-found-glow-one" />
      <div className="not-found-glow not-found-glow-two" />

      <section className="not-found-content">
        <div className="not-found-badge">
          COLLABKART MATCHING ENGINE
        </div>

        <div className="not-found-match-scene">
          <div className="not-found-person-card not-found-brand-card">
            <div className="not-found-avatar">B</div>
            <div>
              <strong>Brand</strong>
              <span>Looking for a page</span>
            </div>
          </div>

          <div className="not-found-score">
            <span>0%</span>
            <small>MATCH</small>
          </div>

          <div className="not-found-person-card not-found-creator-card">
            <div className="not-found-avatar">?</div>
            <div>
              <strong>Missing Page</strong>
              <span>Last seen: nowhere</span>
            </div>
          </div>
        </div>

        <div className="not-found-code">404</div>

        <h1>Yeah... this isn't a match.</h1>

        <p className="not-found-description">
          Our matching algorithm searched everywhere, but this page has
          absolutely zero compatibility with CollabKart.
        </p>

        <div className="not-found-joke">
          <span>Match analysis</span>

          <div>
            <span>Same niche</span>
            <strong>✕</strong>
          </div>

          <div>
            <span>Within budget</span>
            <strong>✕</strong>
          </div>

          <div>
            <span>Page actually exists</span>
            <strong>Definitely not</strong>
          </div>
        </div>

        <Link to={homePath} className="not-found-button">
          Take me somewhere real
        </Link>

        <p className="not-found-small">
          Error 404 · Even smart matching has limits.
        </p>
      </section>
    </main>
  );
}