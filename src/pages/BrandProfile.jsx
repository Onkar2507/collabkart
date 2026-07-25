import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const NICHES = [
  "Food",
  "Fashion",
  "Tech",
  "Fitness",
  "Travel",
  "Beauty",
  "Gaming",
  "Education",
  "Lifestyle",
  "Other",
];

export default function BrandProfile() {
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [niche, setNiche] = useState("Food");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [goals, setGoals] = useState("");

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const profileRef = doc(
          db,
          "brandProfiles",
          user.uid
        );

        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data();

          setCompanyName(data.companyName || "");
          setNiche(data.niche || "Food");
          setLocation(data.location || "");
          setBudget(data.budget?.toString() || "");
          setGoals(data.goals || "");
        }
      } catch (err) {
        console.error(
          "Error loading brand profile:",
          err
        );

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSaved(false);
    setSaving(true);

    try {
      await setDoc(
        doc(db, "brandProfiles", user.uid),
        {
          uid: user.uid,
          companyName: companyName.trim(),
          niche,
          location: location.trim(),
          budget: Number(budget),
          goals: goals.trim(),
          updatedAt: serverTimestamp(),
        }
      );

      setSaved(true);
    } catch (err) {
      console.error(
        "Error saving brand profile:",
        err
      );

      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user || loading) {
    return (
      <main className="page-container">
        <div className="dashboard-loading">
          Loading brand profile...
        </div>
      </main>
    );
  }

  const brandInitial = (companyName || "B")
    .charAt(0)
    .toUpperCase();

  return (
    <main className="page-container brand-profile-page">

      <header className="profile-page-header">
        <div>
          <span className="dashboard-eyebrow">
            BRAND SETTINGS
          </span>

          <h1>Brand Profile</h1>

          <p>
            Manage your brand information and campaign
            preferences used for creator matching.
          </p>
        </div>
      </header>

      {saved && (
        <div className="alert alert-success">
          Profile saved successfully.
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="brand-profile-layout">

        {/* Left Profile Preview */}

        <aside className="brand-profile-preview card">

          <div className="brand-profile-avatar">
            {brandInitial}
          </div>

          <h2>
            {companyName || "Your Brand"}
          </h2>

          <p className="brand-profile-type">
            Brand Account
          </p>

          <div className="brand-profile-preview-info">

            <div>
              <span>Niche</span>
              <strong>
                {niche || "Not specified"}
              </strong>
            </div>

            <div>
              <span>Location</span>
              <strong>
                {location || "Not specified"}
              </strong>
            </div>

            <div>
              <span>Campaign Budget</span>
              <strong>
                {budget
                  ? `₹${Number(
                      budget
                    ).toLocaleString("en-IN")}`
                  : "Not specified"}
              </strong>
            </div>

          </div>

          <div className="profile-match-note">
            <div className="profile-match-note-icon">
              ◇
            </div>

            <div>
              <strong>
                Used for smart matching
              </strong>

              <p>
                Your niche, location and budget help
                CollabKart rank relevant creators.
              </p>
            </div>
          </div>

        </aside>


        {/* Form */}

        <section className="brand-profile-form-card card">

          <div className="profile-form-heading">
            <h2>Brand Information</h2>

            <p>
              Keep these details accurate to improve
              your creator recommendations.
            </p>
          </div>


          <form
            className="profile-form"
            onSubmit={handleSave}
          >

            <div className="profile-field profile-field-full">

              <label htmlFor="companyName">
                Company Name
              </label>

              <input
                id="companyName"
                type="text"
                placeholder="Enter your company name"
                value={companyName}
                onChange={(e) =>
                  setCompanyName(e.target.value)
                }
                required
              />

            </div>


            <div className="profile-form-row">

              <div className="profile-field">

                <label htmlFor="brandNiche">
                  Brand Niche
                </label>

                <select
                  id="brandNiche"
                  value={niche}
                  onChange={(e) =>
                    setNiche(e.target.value)
                  }
                >
                  {NICHES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>

                <small>
                  Used as the strongest matching factor.
                </small>

              </div>


              <div className="profile-field">

                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  type="text"
                  placeholder="Pune, Maharashtra"
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  required
                />

                <small>
                  Use City, State for better matching.
                </small>

              </div>

            </div>


            <div className="profile-field profile-field-full">

              <label htmlFor="budget">
                Campaign Budget
              </label>

              <div className="budget-input-wrapper">

                <span>₹</span>

                <input
                  id="budget"
                  type="number"
                  placeholder="30000"
                  value={budget}
                  onChange={(e) =>
                    setBudget(e.target.value)
                  }
                  min="1"
                  required
                />

              </div>

              <small>
                Creators are ranked partly by how well
                their rate fits this budget.
              </small>

            </div>


            <div className="profile-field profile-field-full">

              <div className="profile-label-row">

                <label htmlFor="goals">
                  Campaign Goals
                </label>

                <span>
                  {goals.length} characters
                </span>

              </div>

              <textarea
                id="goals"
                placeholder="Describe what you want to achieve with your creator campaigns..."
                value={goals}
                onChange={(e) =>
                  setGoals(e.target.value)
                }
                rows={5}
                required
              />

            </div>


            <div className="profile-form-footer">

              <div>
                <strong>
                  Matching preferences
                </strong>

                <span>
                  Changes will affect future creator
                  recommendations.
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        </section>

      </div>

    </main>
  );
}