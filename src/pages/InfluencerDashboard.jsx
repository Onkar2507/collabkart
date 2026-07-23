import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { getRatingsByInfluencer } from "../utils/reviews";

export default function InfluencerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadDashboard = async () => {
      try {
        const [profileSnap, requestSnap, ratings] = await Promise.all([
          getDoc(doc(db, "influencerProfiles", user.uid)),
          getDocs(query(collection(db, "requests"), where("influencerId", "==", user.uid))),
          getRatingsByInfluencer(),
        ]);

        setProfile(profileSnap.exists() ? profileSnap.data() : null);
        setRequests(
          requestSnap.docs.map((requestDoc) => ({
            id: requestDoc.id,
            ...requestDoc.data(),
          }))
        );
        setRatingSummary(ratings[user.uid] || null);
      } catch (err) {
        console.error("Error loading influencer dashboard:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  if (!user || loading) {
    return <p>Loading dashboard...</p>;
  }

  const pendingRequests = requests.filter((request) => request.status === "pending");
  const activeRequests = requests.filter((request) => request.status === "accepted");
  const completedRequests = requests.filter((request) => request.status === "completed");
  const recentRequests = [...requests]
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
    .slice(0, 3);

  return (
    <div>
      <h2>Influencer Dashboard</h2>

      {error && <p>{error}</p>}

      <section>
        <h3>{profile?.name || "Your Profile"}</h3>
        <p>
          Rating: {ratingSummary ? `${ratingSummary.average.toFixed(1)} / 5` : "No reviews yet"}
        </p>
        <p>Review count: {ratingSummary?.count || 0}</p>
        <p>Pending requests: {pendingRequests.length}</p>
        <p>Active collaborations: {activeRequests.length}</p>
        <p>Completed collaborations: {completedRequests.length}</p>
      </section>

      <p>
        <button onClick={() => navigate("/profile/influencer")}>Influencer Profile</button>{" "}
        <button onClick={() => navigate("/incoming-requests")}>Incoming Requests</button>
      </p>

      <section>
        <h3>Recent Incoming Requests</h3>

        {recentRequests.length === 0 ? (
          <p>No collaboration requests yet.</p>
        ) : (
          recentRequests.map((request) => (
            <div key={request.id}>
              <p>
                <strong>{request.brandName}</strong> — {request.status}
              </p>
              <p>{request.message || "No message"}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
