import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

import { auth, db } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoggingIn(true);

    try {
      // Step 1: Login with Firebase Authentication
      const cred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Step 2: Get user document from Firestore
      const userRef = doc(
        db,
        "users",
        cred.user.uid
      );

      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("User profile not found.");
        return;
      }

      // Step 3: Get role
      const userData = userSnap.data();
      const role = userData.role;

      // Step 4: Role-based redirect
      if (role === "influencer") {
        navigate("/dashboard/influencer");
      } else if (role === "brand") {
        navigate("/dashboard/brand");
      } else {
        setError("Invalid user role.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message);
    } finally {
      setLoggingIn(false);
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
              CREATOR COLLABORATIONS
            </span>

            <h1>
              Partnerships that
              <span> actually fit.</span>
            </h1>

            <p>
              CollabKart connects brands with relevant
              creators using smart matching, collaboration
              management and real-time communication.
            </p>

          </div>

          <div className="auth-feature-list">

            <div className="auth-feature">
              <div>01</div>

              <span>
                <strong>Smart creator matching</strong>
                <small>
                  Find creators based on niche, budget,
                  location and audience.
                </small>
              </span>
            </div>

            <div className="auth-feature">
              <div>02</div>

              <span>
                <strong>Manage collaborations</strong>
                <small>
                  Track requests from first contact through
                  completion.
                </small>
              </span>
            </div>

            <div className="auth-feature">
              <div>03</div>

              <span>
                <strong>Real-time conversations</strong>
                <small>
                  Communicate directly once a partnership
                  is accepted.
                </small>
              </span>
            </div>

          </div>

        </div>

        <p className="auth-showcase-footer">
          Built for better brand × creator partnerships.
        </p>

      </section>

      {/* Login Side */}

      <section className="auth-form-side">

        <div className="auth-form-container">

          <div className="auth-mobile-logo">
            <div className="auth-logo-mark">
              C
            </div>

            <span>CollabKart</span>
          </div>

          <div className="auth-form-heading">
            <span>WELCOME BACK</span>

            <h2>Sign in to CollabKart</h2>

            <p>
              Continue managing your collaborations.
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
            onSubmit={handleLogin}
          >

            <div className="auth-field">
              <label htmlFor="loginEmail">
                Email address
              </label>

              <input
                id="loginEmail"
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

            <div className="auth-field">
              <label htmlFor="loginPassword">
                Password
              </label>

              <input
                id="loginPassword"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loggingIn}
            >
              {loggingIn
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

          <div className="auth-divider">
            <span />
            <p>NEW TO COLLABKART?</p>
            <span />
          </div>

          <Link
            to="/signup"
            className="auth-secondary-action"
          >
            Create an account
          </Link>

          <p className="auth-role-note">
            Brand and creator accounts are automatically
            directed to their respective dashboards.
          </p>

        </div>

      </section>

    </main>
  );
}