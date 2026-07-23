import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

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
        const [brandSnap, requestSnap, reviewSnap, influencerSnap, ratings] =
          await Promise.all([
            getDoc(doc(db, "brandProfiles", user.uid)),
            getDocs(query(collection(db, "requests"), where("brandId", "==", user.uid))),
            getDocs(query(collection(db, "reviews"), where("brandId", "==", user.uid))),
            getDocs(collection(db, "influencerProfiles")),
            getRatingsByInfluencer(),
          ]);

        const brandData = brandSnap.exists() ? brandSnap.data() : null;
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
          brandData ? getScoredInfluencers(brandData, influencers).slice(0, 3) : []
        );
      } catch (err) {
        console.error("Error loading brand dashboard:", err);
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

  return (
    <div>
      <h2>Brand Dashboard</h2>

      {error && <p>{error}</p>}

      <section>
        <h3>{brand?.companyName || "Your Brand"}</h3>
        {!brand && <p>Create your brand profile to receive recommendations.</p>}
        <p>Total requests sent: {requests.length}</p>
        <p>Pending requests: {pendingRequests.length}</p>
        <p>Active collaborations: {activeRequests.length}</p>
        <p>Completed collaborations: {completedRequests.length}</p>
        <p>Reviews given: {reviewsGiven}</p>
      </section>

      <p>
        <button onClick={() => navigate("/influencers")}>Browse Influencers</button>{" "}
        <button onClick={() => navigate("/matches")}>View All Matches</button>{" "}
        <button onClick={() => navigate("/my-requests")}>My Requests</button>
      </p>

      <section>
        <h3>Recommended Influencers</h3>

        {recommendations.length === 0 ? (
          <p>No recommendations available yet.</p>
        ) : (
          recommendations.map((influencer) => {
            const rating = ratingsByInfluencer[influencer.uid || influencer.id];

            return (
              <div key={influencer.id}>
                <h4>{influencer.name}</h4>
                <p>Niche: {influencer.niche}</p>
                <p>Location: {influencer.location}</p>
                <p>Match: {influencer.matchScore}%</p>
                <p>
                  Rating: {rating ? `${rating.average.toFixed(1)} / 5 (${rating.count} ${rating.count === 1 ? "review" : "reviews"})` : "No reviews yet"}
                </p>
                <p>Rate: ₹{influencer.rate}</p>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
