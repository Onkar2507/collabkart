import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { getRatingsByInfluencer } from "../utils/reviews";

export default function InfluencerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);

  const [rating, setRating] = useState({
    averageRating: 0,
    reviewCount: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadDashboard = async () => {
      try {
        // Load influencer profile
        const profileSnapshot = await getDocs(
          query(
            collection(db, "influencerProfiles"),
            where("uid", "==", user.uid)
          )
        );

        if (!profileSnapshot.empty) {
          setProfile(profileSnapshot.docs[0].data());
        }

        // Load incoming collaboration requests
        const requestSnapshot = await getDocs(
          query(
            collection(db, "requests"),
            where("influencerId", "==", user.uid)
          )
        );

        const requestData = requestSnapshot.docs.map((requestDoc) => ({
          id: requestDoc.id,
          ...requestDoc.data(),
        }));

        setRequests(requestData);

        // Load influencer rating using the existing review helper
        const ratingsByInfluencer = await getRatingsByInfluencer();
        const influencerRating = ratingsByInfluencer[user.uid];

        setRating({
          averageRating: influencerRating?.average || 0,
          reviewCount: influencerRating?.count || 0,
        });
      } catch (error) {
        console.error("Failed to load influencer dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  const pendingCount = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const activeCount = requests.filter(
    (request) => request.status === "accepted"
  ).length;

  const completedCount = requests.filter(
    (request) => request.status === "completed"
  ).length;

  const recentRequests = requests.slice(0, 3);

  if (loading) {
    return (
      <main className="page-container">
        <div className="dashboard-loading">
          Loading your dashboard...
        </div>
      </main>
    );
  }

  const influencerName =
    profile?.name ||
    profile?.influencerName ||
    "Creator";

  const initial = influencerName.charAt(0).toUpperCase();

  return (
    <main className="page-container influencer-dashboard">

      {/* Dashboard Header */}

      <header className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">
            CREATOR WORKSPACE
          </span>

          <h1>
            Welcome back, {influencerName}
          </h1>

          <p>
            Track collaboration requests, your creator reputation
            and recent brand activity.
          </p>
        </div>

        <div className="dashboard-hero-profile">
          <div className="dashboard-avatar">
            {initial}
          </div>

          <div>
            <strong>
              {influencerName}
            </strong>

            <span>
              Content Creator
            </span>
          </div>
        </div>
      </header>


      {/* Statistics */}

      <section className="dashboard-stats">

        {/* Rating */}

        <article className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">
              Rating
            </span>

            <span className="stat-icon stat-icon-rating">
              ★
            </span>
          </div>

          <div className="stat-value">
            {rating.reviewCount > 0
              ? `${rating.averageRating.toFixed(1)} / 5`
              : "—"}
          </div>

          <div className="stat-description">
            {rating.reviewCount > 0
              ? `${rating.reviewCount} ${
                  rating.reviewCount === 1
                    ? "review"
                    : "reviews"
                }`
              : "No reviews yet"}
          </div>
        </article>


        {/* Pending */}

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
            {pendingCount}
          </div>

          <div className="stat-description">
            Awaiting your response
          </div>
        </article>


        {/* Active */}

        <article className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">
              Active
            </span>

            <span className="stat-icon stat-icon-active">
              ↗
            </span>
          </div>

          <div className="stat-value">
            {activeCount}
          </div>

          <div className="stat-description">
            Ongoing collaborations
          </div>
        </article>


        {/* Completed */}

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
            {completedCount}
          </div>

          <div className="stat-description">
            Finished partnerships
          </div>
        </article>

      </section>


      {/* Recent Requests */}

      <section className="dashboard-section">

        <div className="dashboard-section-header">

          <div>
            <h2>
              Recent Incoming Requests
            </h2>

            <p>
              Your latest collaboration opportunities from brands.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              navigate("/incoming-requests")
            }
          >
            View all requests
          </button>

        </div>


        {recentRequests.length === 0 ? (

          <div className="dashboard-empty card">

            <div className="dashboard-empty-icon">
              ◎
            </div>

            <h3>
              No collaboration requests yet
            </h3>

            <p>
              New collaboration opportunities from brands
              will appear here.
            </p>

          </div>

        ) : (

          <div className="request-list">

            {recentRequests.map((request) => (

              <article
                className="request-card card"
                key={request.id}
              >

                <div className="request-brand-avatar">
                  {(request.brandName || "B")
                    .charAt(0)
                    .toUpperCase()}
                </div>


                <div className="request-card-content">

                  <div className="request-card-heading">

                    <div>
                      <h3>
                        {request.brandName || "Brand"}
                      </h3>

                      <span>
                        Collaboration request
                      </span>
                    </div>


                    <span
                      className={`status-badge status-${
                        request.status || "pending"
                      }`}
                    >
                      {request.status || "pending"}
                    </span>

                  </div>


                  <p className="request-message">
                    {request.message ||
                      "No collaboration message provided."}
                  </p>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>


      {/* Quick Actions */}

      <section className="dashboard-actions">

        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            navigate("/incoming-requests")
          }
        >
          Manage Requests
        </button>


        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            navigate("/profile/influencer")
          }
        >
          Edit Creator Profile
        </button>

      </section>

    </main>
  );
}