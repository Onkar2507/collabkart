import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { getRatingsByInfluencer } from "../utils/reviews";

export default function Matches() {
  const { user } = useAuth();

  const [matches, setMatches] = useState([]);
  const [ratingsByInfluencer, setRatingsByInfluencer] = useState({});
  const [brand, setBrand] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadMatches = async () => {
      try {
        // Load brand profile
        const brandSnap = await getDoc(
          doc(db, "brandProfiles", user.uid)
        );

        if (!brandSnap.exists()) {
          throw new Error("Brand profile not found.");
        }

        const brandData = brandSnap.data();
        setBrand(brandData);

        // Load influencers
        const [influencerSnap, ratings] = await Promise.all([
          getDocs(collection(db, "influencerProfiles")),
          getRatingsByInfluencer(),
        ]);

        const influencers = influencerSnap.docs.map((profileDoc) => ({
          id: profileDoc.id,
          ...profileDoc.data(),
        }));

        setRatingsByInfluencer(ratings);

        // Calculate scores
        const scoredInfluencers = influencers.map((influencer) => {
          let nicheScore = 0;
          let budgetScore = 0;
          let locationScore = 0;
          let followerScore = 0;

          // -------------------------
          // NICHE — MAX 35
          // -------------------------

          if (influencer.niche === brandData.niche) {
            nicheScore = 35;
          }

          // -------------------------
          // BUDGET — MAX 25
          // -------------------------

          const rate = Number(influencer.rate);
          const budget = Number(brandData.budget);

          if (rate <= budget * 0.5) {
            budgetScore = 25;
          } else if (rate <= budget * 0.75) {
            budgetScore = 22;
          } else if (rate <= budget) {
            budgetScore = 18;
          } else if (rate <= budget * 1.25) {
            budgetScore = 8;
          }

          // -------------------------
          // LOCATION — MAX 25
          // -------------------------

          const brandLocation = (brandData.location || "")
            .toLowerCase()
            .split(",")
            .map((part) => part.trim());

          const influencerLocation = (influencer.location || "")
            .toLowerCase()
            .split(",")
            .map((part) => part.trim());

          const brandCity = brandLocation[0] || "";
          const brandState = brandLocation[1] || "";

          const influencerCity = influencerLocation[0] || "";
          const influencerState = influencerLocation[1] || "";

          if (
            brandCity &&
            influencerCity &&
            brandCity === influencerCity
          ) {
            locationScore = 25;
          } else if (
            brandState &&
            influencerState &&
            brandState === influencerState
          ) {
            locationScore = 18;
          } else {
            locationScore = 5;
          }

          // -------------------------
          // FOLLOWERS — MAX 15
          // -------------------------

          switch (influencer.followerRange) {
            case "500k+":
              followerScore = 15;
              break;

            case "100k-500k":
              followerScore = 12;
              break;

            case "50k-100k":
              followerScore = 9;
              break;

            case "10k-50k":
              followerScore = 6;
              break;

            case "1k-10k":
              followerScore = 3;
              break;

            default:
              followerScore = 0;
          }

          const matchScore =
            nicheScore +
            budgetScore +
            locationScore +
            followerScore;

          return {
            ...influencer,

            matchScore,

            scoreBreakdown: {
              niche: nicheScore,
              budget: budgetScore,
              location: locationScore,
              followers: followerScore,
            },
          };
        });

        // Highest score first
        scoredInfluencers.sort(
          (a, b) => b.matchScore - a.matchScore
        );

        // Only show Top 20
        setMatches(scoredInfluencers.slice(0, 20));
      } catch (err) {
        console.error("Error finding matches:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [user]);

  // -------------------------
  // MATCH LABEL
  // -------------------------

  const getMatchLabel = (score) => {
    if (score >= 85) return "Excellent Match";
    if (score >= 70) return "Good Match";
    if (score >= 50) return "Fair Match";

    return "Low Match";
  };

  // -------------------------
  // SEND REQUEST
  // -------------------------

  const handleSendRequest = async (influencer) => {
    if (!user) {
      setError("You must be logged in.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a collaboration message.");
      return;
    }

    setError("");
    setSendingId(influencer.id);

    try {
      // Make sure logged-in account is a brand
      const userSnap = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!userSnap.exists()) {
        throw new Error("User account not found.");
      }

      if (userSnap.data().role !== "brand") {
        throw new Error(
          "Only brand accounts can send collaboration requests."
        );
      }

      // Check for an existing active request
      const existingRequestQuery = query(
        collection(db, "requests"),
        where("brandId", "==", user.uid),
        where("influencerId", "==", influencer.uid)
      );

      const existingSnapshot = await getDocs(
        existingRequestQuery
      );

      const alreadyExists = existingSnapshot.docs.some(
        (requestDoc) => {
          const status = requestDoc.data().status;

          return (
            status === "pending" ||
            status === "accepted"
          );
        }
      );

      if (alreadyExists) {
        throw new Error(
          "You already have an active request with this influencer."
        );
      }

      // Create request
      await addDoc(collection(db, "requests"), {
        brandId: user.uid,
        influencerId: influencer.uid,

        brandName: brand.companyName,
        influencerName: influencer.name,

        message: message.trim(),
        status: "pending",

        matchScore: influencer.matchScore,

        createdAt: serverTimestamp(),
      });

      alert(`Request sent to ${influencer.name}!`);

      setMessage("");
    } catch (err) {
      console.error("Error sending request:", err);
      setError(err.message);
    } finally {
      setSendingId(null);
    }
  };

  if (!user || loading) {
    return <p>Finding your best matches...</p>;
  }

  return (
    <div>
      <h2>Top Recommended Influencers</h2>

      {brand && (
        <>
          <p>
            Brand: <strong>{brand.companyName}</strong>
          </p>

          <p>
            Niche: <strong>{brand.niche}</strong>
          </p>

          <p>
            Location: <strong>{brand.location}</strong>
          </p>

          <p>
            Budget: <strong>₹{brand.budget}</strong>
          </p>
        </>
      )}

      <br />

      <textarea
        placeholder="Write a collaboration message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
      />

      {error && <p>{error}</p>}

      <hr />

      {matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        matches.map((influencer, index) => (
          <div key={influencer.id}>
            <h3>
              #{index + 1} {influencer.name}
            </h3>

            <h4>
              {influencer.matchScore}% —{" "}
              {getMatchLabel(influencer.matchScore)}
            </h4>

            {ratingsByInfluencer[influencer.uid || influencer.id] ? (
              <p>
                Rating: {ratingsByInfluencer[influencer.uid || influencer.id].average.toFixed(1)} / 5
                {" "}({ratingsByInfluencer[influencer.uid || influencer.id].count} {ratingsByInfluencer[influencer.uid || influencer.id].count === 1 ? "review" : "reviews"})
              </p>
            ) : (
              <p>No reviews yet.</p>
            )}

            <p>Niche: {influencer.niche}</p>

            <p>
              Location: {influencer.location}
            </p>

            <p>
              Followers: {influencer.followerRange}
            </p>

            <p>Rate: ₹{influencer.rate}</p>

            <p>Bio: {influencer.bio}</p>

            <p>
              Niche: {influencer.scoreBreakdown.niche}/35
            </p>

            <p>
              Budget: {influencer.scoreBreakdown.budget}/25
            </p>

            <p>
              Location:{" "}
              {influencer.scoreBreakdown.location}/25
            </p>

            <p>
              Followers:{" "}
              {influencer.scoreBreakdown.followers}/15
            </p>

            <button
              onClick={() =>
                handleSendRequest(influencer)
              }
              disabled={sendingId === influencer.id}
            >
              {sendingId === influencer.id
                ? "Sending..."
                : "Send Collaboration Request"}
            </button>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}
