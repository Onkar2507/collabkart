import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { createUserWithEmailAndPassword } from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";

export default function Signup() {
  const [searchParams] = useSearchParams();

  // Read role from URL
  // /signup?role=brand
  // /signup?role=influencer
  const roleFromUrl = searchParams.get("role");

  const initialRole =
    roleFromUrl === "brand" ||
    roleFromUrl === "influencer"
      ? roleFromUrl
      : "influencer";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialRole);

  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setCreating(true);

    try {
      // Create Firebase Authentication account
      const cred =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      // Save user + role in Firestore
      await setDoc(
        doc(db, "users", cred.user.uid),
        {
          uid: cred.user.uid,
          email: email.trim(),
          role,
          createdAt: serverTimestamp(),
        }
      );

      // Redirect to profile setup
      if (role === "influencer") {
        navigate("/profile/influencer");
      } else {
        navigate("/profile/brand");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="auth-page">

      {/* Left Side */}

      <section className="auth-showcase">

        <div className="auth-showcase-content">

          <div className="auth-logo">
            <div className="auth-logo-mark">
              C
            </div>

            <span>CollabKart</span>
          </div>

          <div className="auth-showcase-copy">

            <span className="auth-eyebrow">
              JOIN COLLABKART
            </span>

            <h1>
              Create partnerships
              <span> that make sense.</span>
            </h1>

            <p>
              Whether you're a brand looking for the
              right creators or a creator looking for
              relevant partnerships, CollabKart brings
              everything together.
            </p>

          </div>

          <div className="auth-feature-list">

            <div className="auth-feature">
              <div>01</div>

              <span>
                <strong>
                  Create your profile
                </strong>

                <small>
                  Tell CollabKart about your brand or
                  creator identity.
                </small>
              </span>
            </div>

            <div className="auth-feature">
              <div>02</div>

              <span>
                <strong>
                  Find the right partners
                </strong>

                <small>
                  Smart matching ranks creators using
                  campaign-relevant factors.
                </small>
              </span>
            </div>

            <div className="auth-feature">
              <div>03</div>

              <span>
                <strong>
                  Collaborate in one place
                </strong>

                <small>
                  Manage requests, conversations,
                  completion and reviews.
                </small>
              </span>
            </div>

          </div>

        </div>

        <p className="auth-showcase-footer">
          One platform. Better collaborations.
        </p>

      </section>

      {/* Signup Side */}

      <section className="auth-form-side">

        <div className="auth-form-container">

          <div className="auth-mobile-logo">
            <div className="auth-logo-mark">
              C
            </div>

            <span>CollabKart</span>
          </div>

          <div className="auth-form-heading">

            <span>GET STARTED</span>

            <h2>Create your account</h2>

            <p>
              Choose your account type and start
              building collaborations.
            </p>

          </div>

          {error && (
            <div className="auth-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSignup}
          >

            {/* Email */}

            <div className="auth-field">

              <label htmlFor="signupEmail">
                Email address
              </label>

              <input
                id="signupEmail"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
                required
              />

            </div>

            {/* Password */}

            <div className="auth-field">

              <label htmlFor="signupPassword">
                Password
              </label>

              <input
                id="signupPassword"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="new-password"
                minLength="6"
                required
              />

              <small className="auth-field-hint">
                Use at least 6 characters.
              </small>

            </div>

            {/* Role Selection */}

            <div className="auth-role-section">

              <label>
                I want to join as
              </label>

              <div className="auth-role-options">

                {/* Creator */}

                <button
                  type="button"
                  className={`auth-role-card ${
                    role === "influencer"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setRole("influencer")
                  }
                >

                  <div className="auth-role-icon">
                    C
                  </div>

                  <span>
                    <strong>Creator</strong>

                    <small>
                      Find brands and collaboration
                      opportunities.
                    </small>
                  </span>

                  <div className="auth-role-check">
                    {role === "influencer"
                      ? "✓"
                      : ""}
                  </div>

                </button>

                {/* Brand */}

                <button
                  type="button"
                  className={`auth-role-card ${
                    role === "brand"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setRole("brand")
                  }
                >

                  <div className="auth-role-icon">
                    B
                  </div>

                  <span>
                    <strong>Brand</strong>

                    <small>
                      Discover creators and manage
                      campaigns.
                    </small>
                  </span>

                  <div className="auth-role-check">
                    {role === "brand"
                      ? "✓"
                      : ""}
                  </div>

                </button>

              </div>

            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={creating}
            >
              {creating
                ? "Creating account..."
                : role === "brand"
                  ? "Create Brand Account"
                  : "Create Creator Account"}
            </button>

          </form>

          <div className="auth-divider">
            <span />
            <p>ALREADY HAVE AN ACCOUNT?</p>
            <span />
          </div>

          <Link
            to="/login"
            className="auth-secondary-action"
          >
            Sign in instead
          </Link>

          <p className="auth-role-note">
            Your account type determines which
            CollabKart tools and dashboard you'll use.
          </p>

        </div>

      </section>

    </main>
  );
}