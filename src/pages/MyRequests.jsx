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
  const [reviewedRequestIds, setReviewedRequestIds] = useState(new Set());
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

        const [snapshot, reviewsSnapshot] = await Promise.all([
          getDocs(q),
          getDocs(reviewsQuery),
        ]);

        const requestList = snapshot.docs.map((requestDoc) => ({
          id: requestDoc.id,
          ...requestDoc.data(),
        }));

        setRequests(requestList);
        setReviewedRequestIds(
          new Set(reviewsSnapshot.docs.map((reviewDoc) => reviewDoc.id))
        );
      } catch (err) {
        console.error("Error loading brand requests:", err);
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
      await updateDoc(doc(db, "requests", request.id), {
        status: "completed",
      });

      setRequests((currentRequests) =>
        currentRequests.map((currentRequest) =>
          currentRequest.id === request.id
            ? { ...currentRequest, status: "completed" }
            : currentRequest
        )
      );
    } catch (err) {
      console.error("Error completing request:", err);
      setError(err.message);
    } finally {
      setCompletingId(null);
    }
  };

  const handleReviewInputChange = (requestId, field, value) => {
    setReviewInputs((currentInputs) => ({
      ...currentInputs,
      [requestId]: {
        ...currentInputs[requestId],
        [field]: value,
      },
    }));
  };

  const handleSubmitReview = async (request) => {
    if (request.status !== "completed" || reviewedRequestIds.has(request.id)) {
      return;
    }

    const reviewInput = reviewInputs[request.id] || {};
    const rating = Number(reviewInput.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Rating must be a whole number from 1 to 5.");
      return;
    }

    setReviewingId(request.id);
    setError("");

    try {
      await setDoc(doc(db, "reviews", request.id), {
        requestId: request.id,
        brandId: request.brandId,
        influencerId: request.influencerId,
        brandName: request.brandName,
        influencerName: request.influencerName,
        rating,
        comment: reviewInput.comment?.trim() || "",
        createdAt: serverTimestamp(),
      });

      setReviewedRequestIds((currentIds) =>
        new Set([...currentIds, request.id])
      );
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.message);
    } finally {
      setReviewingId(null);
    }
  };

  if (!user || loading) {
    return <p>Loading requests...</p>;
  }

  return (
    <div>
      <h2>My Requests</h2>

      {error && <p>{error}</p>}

      {requests.length === 0 ? (
        <p>No requests sent yet.</p>
      ) : (
        requests.map((request) => (
          <div key={request.id}>
            <h3>{request.influencerName}</h3>

            <p>
              Message: {request.message || "No message"}
            </p>

            <p>Status: {request.status}</p>

            {(request.status === "accepted" ||
              request.status === "completed") && (
              <>
                <button onClick={() => navigate(`/chat/${request.id}`)}>
                  Open Chat
                </button>

                {request.status === "accepted" && (
                  <>
                    {" "}
                    <button
                      onClick={() => handleComplete(request)}
                      disabled={completingId === request.id}
                    >
                      {completingId === request.id
                        ? "Completing..."
                        : "Mark as Completed"}
                    </button>
                  </>
                )}
              </>
            )}

            {request.status === "completed" &&
              (reviewedRequestIds.has(request.id) ? (
                <p>This collaboration has already been reviewed.</p>
              ) : (
                <div>
                  <label>
                    Rating (1-5)
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="1"
                      value={reviewInputs[request.id]?.rating || ""}
                      onChange={(e) =>
                        handleReviewInputChange(
                          request.id,
                          "rating",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <br />

                  <textarea
                    placeholder="Write a review (optional)"
                    value={reviewInputs[request.id]?.comment || ""}
                    onChange={(e) =>
                      handleReviewInputChange(
                        request.id,
                        "comment",
                        e.target.value
                      )
                    }
                    rows={3}
                  />

                  <br />

                  <button
                    onClick={() => handleSubmitReview(request)}
                    disabled={reviewingId === request.id}
                  >
                    {reviewingId === request.id
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>
                </div>
              ))}

            <hr />
          </div>
        ))
      )}
    </div>
  );
}
