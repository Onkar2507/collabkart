import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { getRatingsByInfluencer } from "../utils/reviews";

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

const FOLLOWER_RANGES = [
  "1k-10k",
  "10k-50k",
  "50k-100k",
  "100k-500k",
  "500k+",
];

export default function InfluencerProfile() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [niche, setNiche] = useState("Food");
  const [location, setLocation] = useState("");
  const [followerRange, setFollowerRange] =
    useState("10k-50k");
  const [bio, setBio] = useState("");
  const [rate, setRate] = useState("");
  const [ratingSummary, setRatingSummary] =
    useState(null);

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
          "influencerProfiles",
          user.uid
        );

        const [profileSnap, ratings] =
          await Promise.all([
            getDoc(profileRef),
            getRatingsByInfluencer(),
          ]);

        if (profileSnap.exists()) {
          const data = profileSnap.data();

          setName(data.name || "");
          setNiche(data.niche || "Food");
          setLocation(data.location || "");

          setFollowerRange(
            data.followerRange || "10k-50k"
          );

          setBio(data.bio || "");
          setRate(data.rate?.toString() || "");
        }

        setRatingSummary(
          ratings[user.uid] || null
        );
      } catch (err) {
        console.error(
          "Error loading profile:",
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
        doc(
          db,
          "influencerProfiles",
          user.uid
        ),
        {
          uid: user.uid,
          name: name.trim(),
          niche,
          location: location.trim(),
          followerRange,
          bio: bio.trim(),
          rate: Number(rate),
          updatedAt: serverTimestamp(),
        }
      );

      setSaved(true);
    } catch (err) {
      console.error(
        "Error saving profile:",
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
          Loading creator profile...
        </div>
      </main>
    );
  }

  const creatorInitial = (name || "C")
    .charAt(0)
    .toUpperCase();

  return (
    <main className="page-container creator-profile-page">

      {/* Header */}

      <header className="profile-page-header">
        <div>
          <span className="dashboard-eyebrow">
            CREATOR SETTINGS
          </span>

          <h1>Influencer Profile</h1>

          <p>
            Manage the creator information brands see
            when discovering and matching with you.
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

      <div className="creator-profile-layout">

        {/* Creator Preview */}

        <aside className="creator-profile-preview card">

          <div className="creator-profile-avatar">
            {creatorInitial}
          </div>

          <h2>
            {name || "Your Creator Profile"}
          </h2>

          <p className="creator-profile-type">
            Content Creator
          </p>

          {/* Rating */}

          <div className="creator-profile-rating">
            <span className="creator-rating-star">
              ★
            </span>

            <div>
              {ratingSummary ? (
                <>
                  <strong>
                    {ratingSummary.average.toFixed(1)} / 5
                  </strong>

                  <span>
                    {ratingSummary.count}{" "}
                    {ratingSummary.count === 1
                      ? "review"
                      : "reviews"}
                  </span>
                </>
              ) : (
                <>
                  <strong>New Creator</strong>
                  <span>No reviews yet</span>
                </>
              )}
            </div>
          </div>

          {/* Creator details */}

          <div className="creator-profile-preview-info">

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
              <span>Followers</span>
              <strong>
                {followerRange}
              </strong>
            </div>

            <div>
              <span>Rate Per Post</span>

              <strong>
                {rate
                  ? `₹${Number(
                      rate
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
                Improve your matches
              </strong>

              <p>
                Accurate profile information helps
                brands discover and match with you.
              </p>
            </div>
          </div>

        </aside>

        {/* Form */}

        <section className="creator-profile-form-card card">

          <div className="profile-form-heading">
            <h2>Creator Information</h2>

            <p>
              Keep your profile updated so brands can
              evaluate you accurately.
            </p>
          </div>

          <form
            className="profile-form"
            onSubmit={handleSave}
          >

            {/* Name */}

            <div className="profile-field profile-field-full">
              <label htmlFor="creatorName">
                Creator Name
              </label>

              <input
                id="creatorName"
                type="text"
                placeholder="Enter your creator name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />
            </div>

            {/* Niche + Location */}

            <div className="profile-form-row">

              <div className="profile-field">
                <label htmlFor="creatorNiche">
                  Content Niche
                </label>

                <select
                  id="creatorNiche"
                  value={niche}
                  onChange={(e) =>
                    setNiche(e.target.value)
                  }
                >
                  {NICHES.map((n) => (
                    <option
                      key={n}
                      value={n}
                    >
                      {n}
                    </option>
                  ))}
                </select>

                <small>
                  Helps brands find relevant creators.
                </small>
              </div>

              <div className="profile-field">
                <label htmlFor="creatorLocation">
                  Location
                </label>

                <input
                  id="creatorLocation"
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

            {/* Followers + Rate */}

            <div className="profile-form-row">

              <div className="profile-field">
                <label htmlFor="followers">
                  Follower Range
                </label>

                <select
                  id="followers"
                  value={followerRange}
                  onChange={(e) =>
                    setFollowerRange(
                      e.target.value
                    )
                  }
                >
                  {FOLLOWER_RANGES.map((range) => (
                    <option
                      key={range}
                      value={range}
                    >
                      {range}
                    </option>
                  ))}
                </select>

                <small>
                  Your current audience size.
                </small>
              </div>

              <div className="profile-field">
                <label htmlFor="creatorRate">
                  Rate Per Post
                </label>

                <div className="budget-input-wrapper">
                  <span>₹</span>

                  <input
                    id="creatorRate"
                    type="number"
                    placeholder="5000"
                    value={rate}
                    onChange={(e) =>
                      setRate(e.target.value)
                    }
                    min="1"
                    required
                  />
                </div>

                <small>
                  Your standard collaboration rate.
                </small>
              </div>

            </div>

            {/* Bio */}

            <div className="profile-field profile-field-full">

              <div className="profile-label-row">
                <label htmlFor="creatorBio">
                  Creator Bio
                </label>

                <span>
                  {bio.length} characters
                </span>
              </div>

              <textarea
                id="creatorBio"
                placeholder="Tell brands about your content, audience and what makes your creator profile unique..."
                value={bio}
                onChange={(e) =>
                  setBio(e.target.value)
                }
                rows={5}
                required
              />

              <small>
                This bio appears when brands browse
                your creator profile.
              </small>

            </div>

            {/* Footer */}

            <div className="profile-form-footer">

              <div>
                <strong>
                  Public creator profile
                </strong>

                <span>
                  These details are visible to brands
                  using CollabKart.
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