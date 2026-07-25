import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function MyRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewedRequestIds, setReviewedRequestIds] = useState(
    new Set()
  );

  const [reviewInputs, setReviewInputs] = useState({});
  const [completingId, setCompletingId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadRequests = async () => {
      try {
        const q = query(
          collection(db, "requests"),
          where("brandId", "==", user.uid)
        );

        const reviewsQuery = query(
          collection(db, "reviews"),
          where("brandId", "==", user.uid)
        );

        const [snapshot, reviewsSnapshot] =
          await Promise.all([
            getDocs(q),
            getDocs(reviewsQuery),
          ]);

        const requestList = snapshot.docs.map(
          (requestDoc) => ({
            id: requestDoc.id,
            ...requestDoc.data(),
          })
        );

        setRequests(requestList);

        setReviewedRequestIds(
          new Set(
            reviewsSnapshot.docs.map(
              (reviewDoc) => reviewDoc.id
            )
          )
        );
      } catch (err) {
        console.error(
          "Error loading brand requests:",
          err
        );

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [user]);

  const handleComplete = async (request) => {
    if (request.status !== "accepted") {
      return;
    }

    setCompletingId(request.id);
    setError("");

    try {
      await updateDoc(
        doc(db, "requests", request.id),
        {
          status: "completed",
        }
      );

      setRequests((currentRequests) =>
        currentRequests.map((currentRequest) =>
          currentRequest.id === request.id
            ? {
                ...currentRequest,
                status: "completed",
              }
            : currentRequest
        )
      );
    } catch (err) {
      console.error(
        "Error completing request:",
        err
      );

      setError(err.message);
    } finally {
      setCompletingId(null);
    }
  };

  const handleReviewInputChange = (
    requestId,
    field,
    value
  ) => {
    setReviewInputs((currentInputs) => ({
      ...currentInputs,

      [requestId]: {
        ...currentInputs[requestId],
        [field]: value,
      },
    }));
  };

  const handleSubmitReview = async (request) => {
    if (
      request.status !== "completed" ||
      reviewedRequestIds.has(request.id)
    ) {
      return;
    }

    const reviewInput =
      reviewInputs[request.id] || {};

    const rating = Number(reviewInput.rating);

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      setError(
        "Rating must be a whole number from 1 to 5."
      );

      return;
    }

    setReviewingId(request.id);
    setError("");

    try {
      await setDoc(
        doc(db, "reviews", request.id),
        {
          requestId: request.id,

          brandId: request.brandId,
          influencerId: request.influencerId,

          brandName: request.brandName,
          influencerName: request.influencerName,

          rating,

          comment:
            reviewInput.comment?.trim() || "",

          createdAt: serverTimestamp(),
        }
      );

      setReviewedRequestIds(
        (currentIds) =>
          new Set([
            ...currentIds,
            request.id,
          ])
      );
    } catch (err) {
      console.error(
        "Error submitting review:",
        err
      );

      setError(err.message);
    } finally {
      setReviewingId(null);
    }
  };

  const pendingCount = requests.filter(
    (request) => request.status === "pending"
  ).length;

  const activeCount = requests.filter(
    (request) => request.status === "accepted"
  ).length;

  const completedCount = requests.filter(
    (request) => request.status === "completed"
  ).length;

  if (!user || loading) {
    return (
      <main className="page-container">
        <div className="dashboard-loading">
          Loading collaboration requests...
        </div>
      </main>
    );
  }

  return (
    <main className="page-container requests-page">

      {/* Header */}

      <header className="requests-header">

        <div>
          <span className="dashboard-eyebrow">
            COLLABORATIONS
          </span>

          <h1>My Requests</h1>

          <p>
            Track your creator partnerships from
            request to completion.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            navigate("/influencers")
          }
        >
          Discover Creators
        </button>

      </header>


      {/* Summary */}

      <section className="request-summary-grid">

        <article className="request-summary-card">
          <span>Total</span>
          <strong>{requests.length}</strong>
          <small>Requests sent</small>
        </article>

        <article className="request-summary-card">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
          <small>Awaiting response</small>
        </article>

        <article className="request-summary-card">
          <span>Active</span>
          <strong>{activeCount}</strong>
          <small>In collaboration</small>
        </article>

        <article className="request-summary-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
          <small>Finished partnerships</small>
        </article>

      </section>


      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}


      {/* Requests */}

      <section className="requests-section">

        <div className="requests-section-heading">
          <h2>All Collaborations</h2>

          <p>
            View status, open conversations and
            manage completed partnerships.
          </p>
        </div>


        {requests.length === 0 ? (

          <div className="dashboard-empty card">

            <div className="dashboard-empty-icon">
              ◇
            </div>

            <h3>No collaboration requests yet</h3>

            <p>
              Discover creators and send your first
              collaboration request.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate("/influencers")
              }
            >
              Discover Creators
            </button>

          </div>

        ) : (

          <div className="collaboration-list">

            {requests.map((request) => {
              const reviewed =
                reviewedRequestIds.has(
                  request.id
                );

              const creatorInitial =
                (
                  request.influencerName ||
                  "C"
                )
                  .charAt(0)
                  .toUpperCase();

              return (

                <article
                  className="collaboration-card card"
                  key={request.id}
                >

                  {/* Top */}

                  <div className="collaboration-card-top">

                    <div className="collaboration-creator">

                      <div className="collaboration-avatar">
                        {creatorInitial}
                      </div>

                      <div>
                        <h3>
                          {request.influencerName}
                        </h3>

                        <span>
                          Creator collaboration
                        </span>
                      </div>

                    </div>


                    <span
                      className={`status-badge status-${request.status}`}
                    >
                      {request.status}
                    </span>

                  </div>


                  {/* Message */}

                  <div className="collaboration-message">

                    <span>
                      Collaboration message
                    </span>

                    <p>
                      {request.message ||
                        "No message provided."}
                    </p>

                  </div>


                  {/* Actions */}

                  {(request.status ===
                    "accepted" ||
                    request.status ===
                      "completed") && (

                    <div className="collaboration-actions">

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          navigate(
                            `/chat/${request.id}`
                          )
                        }
                      >
                        Open Chat
                      </button>


                      {request.status ===
                        "accepted" && (

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() =>
                            handleComplete(
                              request
                            )
                          }
                          disabled={
                            completingId ===
                            request.id
                          }
                        >
                          {completingId ===
                          request.id
                            ? "Completing..."
                            : "Mark as Completed"}
                        </button>

                      )}

                    </div>

                  )}


                  {/* Review */}

                  {request.status ===
                    "completed" && (

                    <div className="request-review-section">

                      {reviewed ? (

                        <div className="review-completed">

                          <div className="review-completed-icon">
                            ✓
                          </div>

                          <div>
                            <strong>
                              Review submitted
                            </strong>

                            <span>
                              You've already reviewed
                              this collaboration.
                            </span>
                          </div>

                        </div>

                      ) : (

                        <>
                          <div className="review-heading">

                            <div>
                              <h4>
                                Rate this collaboration
                              </h4>

                              <p>
                                Share your experience
                                working with{" "}
                                {request.influencerName}.
                              </p>
                            </div>

                          </div>


                          <div className="review-form">

                            <div className="review-rating-field">

                              <label
                                htmlFor={`rating-${request.id}`}
                              >
                                Rating
                              </label>

                              <select
                                id={`rating-${request.id}`}
                                value={
                                  reviewInputs[
                                    request.id
                                  ]?.rating || ""
                                }
                                onChange={(e) =>
                                  handleReviewInputChange(
                                    request.id,
                                    "rating",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Select rating
                                </option>

                                <option value="5">
                                  ★★★★★ — Excellent
                                </option>

                                <option value="4">
                                  ★★★★ — Very Good
                                </option>

                                <option value="3">
                                  ★★★ — Good
                                </option>

                                <option value="2">
                                  ★★ — Fair
                                </option>

                                <option value="1">
                                  ★ — Poor
                                </option>
                              </select>

                            </div>


                            <div className="review-comment-field">

                              <label
                                htmlFor={`comment-${request.id}`}
                              >
                                Review
                                <span>
                                  Optional
                                </span>
                              </label>

                              <textarea
                                id={`comment-${request.id}`}
                                placeholder="How was your experience working with this creator?"
                                value={
                                  reviewInputs[
                                    request.id
                                  ]?.comment || ""
                                }
                                onChange={(e) =>
                                  handleReviewInputChange(
                                    request.id,
                                    "comment",
                                    e.target.value
                                  )
                                }
                                rows={3}
                              />

                            </div>


                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() =>
                                handleSubmitReview(
                                  request
                                )
                              }
                              disabled={
                                reviewingId ===
                                request.id
                              }
                            >
                              {reviewingId ===
                              request.id
                                ? "Submitting..."
                                : "Submit Review"}
                            </button>

                          </div>

                        </>

                      )}

                    </div>

                  )}

                </article>

              );
            })}

          </div>

        )}

      </section>

    </main>
  );
}