import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { getScoredInfluencers } from "../utils/matching";
import { getRatingsByInfluencer } from "../utils/reviews";

export default function BrandDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [brand, setBrand] = useState(null);
  const [requests, setRequests] = useState([]);
  const [reviewsGiven, setReviewsGiven] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [ratingsByInfluencer, setRatingsByInfluencer] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      try {
        const [
          brandSnap,
          requestSnap,
          reviewSnap,
          influencerSnap,
          ratings,
        ] = await Promise.all([
          getDoc(doc(db, "brandProfiles", user.uid)),

          getDocs(
            query(
              collection(db, "requests"),
              where("brandId", "==", user.uid)
            )
          ),

          getDocs(
            query(
              collection(db, "reviews"),
              where("brandId", "==", user.uid)
            )
          ),

          getDocs(collection(db, "influencerProfiles")),

          getRatingsByInfluencer(),
        ]);

        const brandData = brandSnap.exists()
          ? brandSnap.data()
          : null;

        const requestList = requestSnap.docs.map((requestDoc) => ({
          id: requestDoc.id,
          ...requestDoc.data(),
        }));

        const influencers = influencerSnap.docs.map((profileDoc) => ({
          id: profileDoc.id,
          ...profileDoc.data(),
        }));

        setBrand(brandData);
        setRequests(requestList);
        setReviewsGiven(reviewSnap.size);
        setRatingsByInfluencer(ratings);

        setRecommendations(
          brandData
            ? getScoredInfluencers(
                brandData,
                influencers
              ).slice(0, 3)
            : []
        );
      } catch (err) {
        console.error(
          "Error loading brand dashboard:",
          err
        );

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  if (!user || loading) {
    return (
      <main className="page-container">
        <div className="dashboard-loading">
          Loading your dashboard...
        </div>
      </main>
    );
  }

  const pendingRequests = requests.filter(
    (request) => request.status === "pending"
  );

  const activeRequests = requests.filter(
    (request) => request.status === "accepted"
  );

  const completedRequests = requests.filter(
    (request) => request.status === "completed"
  );

  const brandName =
    brand?.companyName || "Your Brand";

  const brandInitial =
    brandName.charAt(0).toUpperCase();

  return (
    <main className="page-container brand-dashboard">

      {/* Header */}

      <header className="dashboard-hero">

        <div>
          <span className="dashboard-eyebrow">
            BRAND WORKSPACE
          </span>

          <h1>
            Welcome back, {brandName}
          </h1>

          <p>
            Discover creators, manage collaboration requests
            and keep track of your partnerships.
          </p>
        </div>


        <div className="dashboard-hero-profile">

          <div className="dashboard-avatar">
            {brandInitial}
          </div>

          <div>
            <strong>
              {brandName}
            </strong>

            <span>
              Brand Account
            </span>
          </div>

        </div>

      </header>


      {/* Error */}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}


      {/* No profile */}

      {!brand && (
        <div className="brand-profile-warning">
          <div>
            <strong>
              Complete your brand profile
            </strong>

            <p>
              Add your campaign preferences to receive
              personalized creator recommendations.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              navigate("/profile/brand")
            }
          >
            Complete Profile
          </button>
        </div>
      )}


      {/* Statistics */}

      <section className="dashboard-stats">

        <article className="stat-card">

          <div className="stat-card-top">
            <span className="stat-label">
              Total Requests
            </span>

            <span className="stat-icon stat-icon-total">
              ↗
            </span>
          </div>

          <div className="stat-value">
            {requests.length}
          </div>

          <div className="stat-description">
            Collaboration requests sent
          </div>

        </article>


        <article className="stat-card">

          <div className="stat-card-top">
            <span className="stat-label">
              Pending
            </span>

            <span className="stat-icon stat-icon-pending">
              ◷
            </span>
          </div>

          <div className="stat-value">
            {pendingRequests.length}
          </div>

          <div className="stat-description">
            Waiting for creator response
          </div>

        </article>


        <article className="stat-card">

          <div className="stat-card-top">
            <span className="stat-label">
              Active
            </span>

            <span className="stat-icon stat-icon-active">
              ◇
            </span>
          </div>

          <div className="stat-value">
            {activeRequests.length}
          </div>

          <div className="stat-description">
            Ongoing collaborations
          </div>

        </article>


        <article className="stat-card">

          <div className="stat-card-top">
            <span className="stat-label">
              Completed
            </span>

            <span className="stat-icon stat-icon-completed">
              ✓
            </span>
          </div>

          <div className="stat-value">
            {completedRequests.length}
          </div>

          <div className="stat-description">
            {reviewsGiven}{" "}
            {reviewsGiven === 1
              ? "review given"
              : "reviews given"}
          </div>

        </article>

      </section>


      {/* Recommended Creators */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>
            <h2>
              Recommended Creators
            </h2>

            <p>
              Influencers selected based on your brand
              profile and campaign preferences.
            </p>
          </div>


          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              navigate("/matches")
            }
          >
            View all matches
          </button>

        </div>


        {recommendations.length === 0 ? (

          <div className="dashboard-empty card">

            <div className="dashboard-empty-icon">
              ◎
            </div>

            <h3>
              No recommendations available
            </h3>

            <p>
              Complete your brand profile to receive
              personalized creator recommendations.
            </p>

          </div>

        ) : (

          <div className="creator-grid">

            {recommendations.map((influencer) => {

              const rating =
                ratingsByInfluencer[
                  influencer.uid || influencer.id
                ];

              const creatorInitial =
                (influencer.name || "C")
                  .charAt(0)
                  .toUpperCase();

              return (

                <article
                  className="creator-card card"
                  key={influencer.id}
                >

                  <div className="creator-card-header">

                    <div className="creator-identity">

                      <div className="creator-avatar">
                        {creatorInitial}
                      </div>

                      <div>
                        <h3>
                          {influencer.name}
                        </h3>

                        <span>
                          {influencer.niche || "Creator"}
                        </span>
                      </div>

                    </div>


                    <span className="match-badge">
                      {influencer.matchScore}% MATCH
                    </span>

                  </div>


                  <div className="creator-details">

                    <div className="creator-detail">
                      <span>
                        Location
                      </span>

                      <strong>
                        {influencer.location || "Not specified"}
                      </strong>
                    </div>


                    <div className="creator-detail">
                      <span>
                        Rating
                      </span>

                      <strong>
                        {rating
                          ? `★ ${rating.average.toFixed(1)}`
                          : "No reviews"}
                      </strong>
                    </div>


                    <div className="creator-detail">
                      <span>
                        Rate
                      </span>

                      <strong>
                        ₹{influencer.rate || "—"}
                      </strong>
                    </div>

                  </div>


                  <div className="creator-card-footer">

                    <span className="creator-review-count">
                      {rating
                        ? `${rating.count} ${
                            rating.count === 1
                              ? "review"
                              : "reviews"
                          }`
                        : "New creator"}
                    </span>

                    <button
                      type="button"
                      className="creator-view-button"
                      onClick={() =>
                        navigate("/matches")
                      }
                    >
                      View Match
                    </button>

                  </div>

                </article>

              );
            })}

          </div>

        )}

      </section>


      {/* Actions */}

      <section className="dashboard-actions">

        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            navigate("/influencers")
          }
        >
          Browse Creators
        </button>


        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            navigate("/my-requests")
          }
        >
          My Requests
        </button>

      </section>

    </main>
  );
}