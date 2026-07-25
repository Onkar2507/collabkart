import { Link } from "react-router-dom";
import collabkartLogo from "../assets/collabkart-logo.png";

const creators = [
  {
    initials: "AM",
    name: "Aarya Mehta",
    niche: "Tech & AI",
    location: "Pune",
    followers: "50k–100k",
    rating: "4.9",
    rate: "₹8,000",
    match: 94,
  },
  {
    initials: "RK",
    name: "Riya Kapoor",
    niche: "Lifestyle",
    location: "Mumbai",
    followers: "100k–500k",
    rating: "4.8",
    rate: "₹12,000",
    match: 89,
  },
  {
    initials: "AS",
    name: "Arjun Shah",
    niche: "Fitness",
    location: "Bengaluru",
    followers: "10k–50k",
    rating: "4.7",
    rate: "₹5,500",
    match: 86,
  },
];

const steps = [
  {
    number: "01",
    icon: "⌕",
    title: "Discover",
    description:
      "Browse creators by niche, location, audience size and collaboration rate.",
  },
  {
    number: "02",
    icon: "✦",
    title: "Match",
    description:
      "Smart matching scores creators against your brand profile and campaign needs.",
  },
  {
    number: "03",
    icon: "↗",
    title: "Connect",
    description:
      "Send collaboration requests directly to creators you want to work with.",
  },
  {
    number: "04",
    icon: "✓",
    title: "Collaborate",
    description:
      "Chat, complete partnerships and build reputation through reviews.",
  },
];

export default function Landing() {
  return (
    <main className="landing-page">

      {/* Navbar */}

      <nav className="landing-nav">
       <Link to="/" className="landing-brand">
  <img
    src={collabkartLogo}
    alt="CollabKart"
    className="landing-brand-image"
  />
</Link>

        <div className="landing-nav-links">
          <a href="#discover">Discover</a>
          <a href="#how-it-works">How it works</a>
          <a href="#creators">For Creators</a>
        </div>

        <div className="landing-nav-actions">
          <Link to="/login" className="landing-login">
            Sign In
          </Link>

          <Link to="/signup" className="landing-get-started">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}

      <section className="landing-hero">

        <div className="landing-hero-copy">

          <div className="landing-hero-badge">
            <span>✦</span>
            SMART CREATOR MATCHING
          </div>

          <h1>
            Find creators who
            <span> actually fit </span>
            your brand.
          </h1>

          <p className="landing-hero-description">
            Discover relevant creators, compare
            collaboration potential and build
            partnerships — all from one creator
            marketplace.
          </p>

          <div className="landing-hero-actions">

            <Link
              to="/signup?role=brand"
              className="landing-primary-button"
            >
              Join as a Brand
              <span>→</span>
            </Link>

            <Link
              to="/signup?role=influencer"
              className="landing-secondary-button"
            >
              Join as a Creator
            </Link>

          </div>

          <div className="landing-hero-proof">

            <div className="landing-proof-avatars">
              <span>AM</span>
              <span>RK</span>
              <span>AS</span>
              <span>+</span>
            </div>

            <div>
              <strong>
                Built for better partnerships
              </strong>

              <span>
                Brands × Creators × Smart Matching
              </span>
            </div>

          </div>

        </div>

        {/* Marketplace Preview */}

        <div
          className="landing-marketplace-wrap"
          id="discover"
        >

          <div className="landing-floating-badge landing-floating-top">
            <span>✦</span>

            <div>
              <strong>94% Match</strong>
              <small>Strong collaboration fit</small>
            </div>
          </div>

          <div className="landing-marketplace">

            <div className="marketplace-topbar">

              <div>
                <span className="marketplace-dot" />
                <span className="marketplace-dot" />
                <span className="marketplace-dot" />
              </div>

              <span>Creator Marketplace</span>

              <div />
            </div>

            <div className="marketplace-content">

              <div className="marketplace-heading">

                <div>
                  <span>DISCOVER</span>
                  <h3>Creators for your brand</h3>
                </div>

                <div className="marketplace-count">
                  103 creators
                </div>

              </div>

              <div className="marketplace-search">

                <div className="marketplace-search-input">
                  <span>⌕</span>
                  Search creators...
                </div>

                <div className="marketplace-filter">
                  Tech
                  <span>⌄</span>
                </div>

              </div>

              <div className="marketplace-creators">

                {creators.map((creator) => (
                  <article
                    className="marketplace-creator-card"
                    key={creator.name}
                  >

                    <div className="marketplace-creator-main">

                      <div className="marketplace-avatar">
                        {creator.initials}
                      </div>

                      <div className="marketplace-creator-info">

                        <div className="marketplace-name-row">
                          <strong>
                            {creator.name}
                          </strong>

                          <span>
                            {creator.match}% Match
                          </span>
                        </div>

                        <p>
                          {creator.niche}
                          <i>•</i>
                          {creator.location}
                        </p>

                        <div className="marketplace-creator-stats">

                          <span>
                            <b>★ {creator.rating}</b>
                          </span>

                          <span>
                            {creator.followers}
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="marketplace-rate">
                      <small>FROM</small>
                      <strong>{creator.rate}</strong>
                      <span>per post</span>
                    </div>

                  </article>
                ))}

              </div>

              <Link
                to="/signup?role=brand"
                className="marketplace-view-button"
              >
                View all creators
                <span>→</span>
              </Link>

            </div>

          </div>

          <div className="landing-floating-badge landing-floating-bottom">

            <div className="floating-success">
              ✓
            </div>

            <div>
              <strong>Request accepted</strong>
              <small>You can start chatting now</small>
            </div>

          </div>

        </div>

      </section>

      {/* Categories */}

      <section className="landing-categories">

        <p>Find creators across every niche</p>

        <div>
          <span>Technology</span>
          <span>Fashion</span>
          <span>Fitness</span>
          <span>Travel</span>
          <span>Beauty</span>
          <span>Gaming</span>
          <span>Food</span>
          <span>Lifestyle</span>
        </div>

      </section>

      {/* How It Works */}

      <section
        className="landing-how"
        id="how-it-works"
      >

        <div className="landing-section-heading">

          <span>HOW IT WORKS</span>

          <h2>
            From discovery to
            <strong> collaboration.</strong>
          </h2>

          <p>
            CollabKart brings the complete creator
            partnership workflow into one place.
          </p>

        </div>

        <div className="landing-steps">

          {steps.map((step) => (
            <article
              className="landing-step-card"
              key={step.number}
            >

              <div className="landing-step-top">

                <div className="landing-step-icon">
                  {step.icon}
                </div>

                <span>{step.number}</span>

              </div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>

            </article>
          ))}

        </div>

      </section>

      {/* Brand Section */}

      <section className="landing-audience landing-brand-section">

        <div className="landing-audience-copy">

          <span className="landing-section-label">
            FOR BRANDS
          </span>

          <h2>
            Stop searching.
            <br />
            Start <strong>matching.</strong>
          </h2>

          <p>
            Discover creators who align with your
            campaign instead of spending hours
            searching profiles manually.
          </p>

          <div className="landing-benefits">

            <div>
              <span>✓</span>
              Search creators by niche and location
            </div>

            <div>
              <span>✓</span>
              Compare follower range and rates
            </div>

            <div>
              <span>✓</span>
              Get creator match scores
            </div>

            <div>
              <span>✓</span>
              Manage requests and conversations
            </div>

          </div>

          <Link
            to="/signup?role=brand"
            className="landing-primary-button"
          >
            Start finding creators
            <span>→</span>
          </Link>

        </div>

        {/* Brand UI Mockup */}

        <div className="landing-audience-visual">

          <div className="landing-dashboard-preview">

            <div className="preview-header">
              <div>
                <small>YOUR CAMPAIGN</small>
                <strong>Summer Tech Launch</strong>
              </div>

              <span>Active</span>
            </div>

            <div className="preview-match">

              <div className="preview-avatar">
                AM
              </div>

              <div className="preview-person">
                <strong>Aarya Mehta</strong>
                <span>Tech & AI · Pune</span>
              </div>

              <div className="preview-score">
                <strong>94%</strong>
                <span>MATCH</span>
              </div>

            </div>

            <div className="preview-bars">

              <div>
                <span>
                  Niche compatibility
                </span>

                <strong>100%</strong>

                <div>
                  <i style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <span>
                  Budget compatibility
                </span>

                <strong>92%</strong>

                <div>
                  <i style={{ width: "92%" }} />
                </div>
              </div>

              <div>
                <span>
                  Location relevance
                </span>

                <strong>90%</strong>

                <div>
                  <i style={{ width: "90%" }} />
                </div>
              </div>

            </div>

            <div className="preview-action">
              Send Collaboration Request
              <span>→</span>
            </div>

          </div>

        </div>

      </section>

      {/* Creator Section */}

      <section
        className="landing-audience landing-creator-section"
        id="creators"
      >

        <div className="landing-audience-visual">

          <div className="creator-opportunity-card">

            <div className="creator-opportunity-top">

              <div className="creator-brand-avatar">
                TN
              </div>

              <div>
                <strong>TechNova</strong>
                <span>Technology · Pune</span>
              </div>

              <small>NEW</small>

            </div>

            <div className="creator-opportunity-body">

              <span>COLLABORATION REQUEST</span>

              <h3>
                We'd love to work with you.
              </h3>

              <p>
                We're launching a new AI productivity
                product and think your audience would
                be a great fit.
              </p>

              <div className="creator-request-meta">

                <div>
                  <small>CAMPAIGN</small>
                  <strong>Product Launch</strong>
                </div>

                <div>
                  <small>NICHE</small>
                  <strong>Technology</strong>
                </div>

              </div>

              <div className="creator-request-actions">
                <button type="button">
                  Accept Request
                </button>

                <button type="button">
                  Decline
                </button>
              </div>

            </div>

          </div>

        </div>

        <div className="landing-audience-copy">

          <span className="landing-section-label">
            FOR CREATORS
          </span>

          <h2>
            Your audience has value.
            <br />
            Find brands that
            <strong> see it.</strong>
          </h2>

          <p>
            Build your creator profile, receive
            collaboration opportunities and manage
            partnerships without scattered DMs.
          </p>

          <div className="landing-benefits">

            <div>
              <span>✓</span>
              Showcase your niche and audience
            </div>

            <div>
              <span>✓</span>
              Set your collaboration rate
            </div>

            <div>
              <span>✓</span>
              Receive brand requests directly
            </div>

            <div>
              <span>✓</span>
              Build reputation with ratings
            </div>

          </div>

          <Link
            to="/signup?role=influencer"
            className="landing-primary-button"
          >
            Join as a Creator
            <span>→</span>
          </Link>

        </div>

      </section>

      {/* Final CTA */}

      <section className="landing-final-cta">

        <div className="landing-final-inner">

          <span>READY TO COLLABORATE?</span>

          <h2>
            The right partnership could be
            <strong> one match away.</strong>
          </h2>

          <p>
            Join CollabKart as a brand or creator
            and start building partnerships that fit.
          </p>

          <div className="landing-final-actions">

            <Link
              to="/signup?role=brand"
              className="landing-final-primary"
            >
              I'm a Brand
              <span>→</span>
            </Link>

            <Link
              to="/signup?role=influencer"
              className="landing-final-secondary"
            >
              I'm a Creator
            </Link>

          </div>

        </div>

      </section>

      {/* Footer */}

      <footer className="landing-footer">

        <div className="landing-footer-brand">

          <div className="landing-brand-logo">
            CK
          </div>

          <div>
            <strong>CollabKart</strong>
            <span>
              Better creator partnerships.
            </span>
          </div>

        </div>

        <p>
          Creator Marketplace · Smart Matching ·
          Collaboration Management
        </p>

        <span>
          © {new Date().getFullYear()} CollabKart
        </span>

      </footer>

    </main>
  );
}