import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function IncomingRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadRequests = async () => {
      try {
        const q = query(
          collection(db, "requests"),
          where("influencerId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const requestList = snapshot.docs.map((requestDoc) => ({
          id: requestDoc.id,
          ...requestDoc.data(),
        }));

        setRequests(requestList);
      } catch (err) {
        console.error("Error loading requests:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [user]);

  const handleStatus = async (requestId, newStatus) => {
    try {
      setError("");
      setUpdatingId(requestId);

      await updateDoc(doc(db, "requests", requestId), {
        status: newStatus,
      });

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: newStatus }
            : request
        )
      );
    } catch (err) {
      console.error("Error updating request:", err);
      setError(err.message);
    } finally {
      setUpdatingId(null);
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

  const rejectedCount = requests.filter(
    (request) => request.status === "rejected"
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
    <main className="page-container incoming-page">

      {/* Header */}

      <header className="incoming-header">
        <div>
          <span className="dashboard-eyebrow">
            CREATOR OPPORTUNITIES
          </span>

          <h1>Incoming Requests</h1>

          <p>
            Review collaboration opportunities from brands
            and manage your responses.
          </p>
        </div>

        <div className="incoming-total">
          <strong>{requests.length}</strong>
          <span>total requests</span>
        </div>
      </header>

      {/* Summary */}

      <section className="incoming-summary-grid">
        <article className="incoming-summary-card">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
          <small>Awaiting your response</small>
        </article>

        <article className="incoming-summary-card">
          <span>Active</span>
          <strong>{activeCount}</strong>
          <small>Current collaborations</small>
        </article>

        <article className="incoming-summary-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
          <small>Finished partnerships</small>
        </article>

        <article className="incoming-summary-card">
          <span>Declined</span>
          <strong>{rejectedCount}</strong>
          <small>Requests declined</small>
        </article>
      </section>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Requests */}

      <section className="incoming-section">

        <div className="incoming-section-heading">
          <h2>Collaboration Opportunities</h2>

          <p>
            Review each brand request before accepting a
            partnership.
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="dashboard-empty card">
            <div className="dashboard-empty-icon">
              ◇
            </div>

            <h3>No requests yet</h3>

            <p>
              New collaboration opportunities from brands
              will appear here.
            </p>
          </div>
        ) : (
          <div className="incoming-list">

            {requests.map((request) => {
              const brandInitial = (
                request.brandName || "B"
              )
                .charAt(0)
                .toUpperCase();

              const isUpdating =
                updatingId === request.id;

              return (
                <article
                  className="incoming-request-card card"
                  key={request.id}
                >

                  {/* Header */}

                  <div className="incoming-card-header">

                    <div className="incoming-brand">
                      <div className="incoming-brand-avatar">
                        {brandInitial}
                      </div>

                      <div>
                        <h3>
                          {request.brandName ||
                            "Brand"}
                        </h3>

                        <span>
                          Collaboration request
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

                  <div className="incoming-message">
                    <span>Brand Message</span>

                    <p>
                      {request.message ||
                        "No collaboration message provided."}
                    </p>
                  </div>

                  {/* Match Score */}

                  {request.matchScore !== undefined && (
                    <div className="incoming-match-info">

                      <div className="incoming-match-icon">
                        ◇
                      </div>

                      <div>
                        <span>
                          CollabKart Match
                        </span>

                        <strong>
                          {request.matchScore}% match
                        </strong>
                      </div>

                    </div>
                  )}

                  {/* Pending actions */}

                  {request.status === "pending" && (
                    <div className="incoming-actions">

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                          handleStatus(
                            request.id,
                            "accepted"
                          )
                        }
                        disabled={isUpdating}
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Accept Request"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary incoming-reject-btn"
                        onClick={() =>
                          handleStatus(
                            request.id,
                            "rejected"
                          )
                        }
                        disabled={isUpdating}
                      >
                        Decline
                      </button>

                    </div>
                  )}

                  {/* Accepted */}

                  {request.status === "accepted" && (
                    <div className="incoming-active-section">

                      <div className="incoming-active-message">
                        <div>✓</div>

                        <span>
                          Request accepted. You can now
                          communicate with the brand.
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                          navigate(
                            `/chat/${request.id}`
                          )
                        }
                      >
                        Open Chat
                      </button>

                    </div>
                  )}

                  {/* Completed */}

                  {request.status === "completed" && (
                    <div className="incoming-completed-section">

                      <div>
                        <span className="incoming-completed-icon">
                          ✓
                        </span>

                        <div>
                          <strong>
                            Collaboration completed
                          </strong>

                          <p>
                            This partnership has been
                            marked as completed.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          navigate(
                            `/chat/${request.id}`
                          )
                        }
                      >
                        View Chat
                      </button>

                    </div>
                  )}

                  {/* Rejected */}

                  {request.status === "rejected" && (
                    <div className="incoming-declined">
                      This collaboration request was declined.
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