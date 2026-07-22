import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function MyRequests() {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadRequests = async () => {
      try {
        const q = query(
          collection(db, "requests"),
          where("brandId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const requestList = snapshot.docs.map((requestDoc) => ({
          id: requestDoc.id,
          ...requestDoc.data(),
        }));

        setRequests(requestList);
      } catch (err) {
        console.error("Error loading brand requests:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [user]);

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

            <hr />
          </div>
        ))
      )}
    </div>
  );
}