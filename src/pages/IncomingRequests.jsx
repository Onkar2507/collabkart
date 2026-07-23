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
    }
  };

  if (!user || loading) {
    return <p>Loading requests...</p>;
  }

  return (
    <div>
      <h2>Incoming Requests</h2>

      {error && <p>{error}</p>}

      {requests.length === 0 ? (
        <p>No collaboration requests.</p>
      ) : (
        requests.map((request) => (
          <div key={request.id}>
            <h3>{request.brandName}</h3>

            <p>
              Message: {request.message || "No message"}
            </p>

            <p>Status: {request.status}</p>

            {request.status === "pending" && (
              <>
                <button
                  onClick={() =>
                    handleStatus(request.id, "accepted")
                  }
                >
                  Accept
                </button>

                {" "}

                <button
                  onClick={() =>
                    handleStatus(request.id, "rejected")
                  }
                >
                  Reject
                </button>
              </>
            )}

            {(request.status === "accepted" ||
              request.status === "completed") && (
              <button
                onClick={() =>
                  navigate(`/chat/${request.id}`)
                }
              >
                Open Chat
              </button>
            )}

            <hr />
          </div>
        ))
      )}
    </div>
  );
}
