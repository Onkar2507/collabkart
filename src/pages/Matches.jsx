import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Matches() {
  const { user } = useAuth();

  const [matches, setMatches] = useState([]);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadMatches = async () => {
      try {
        // 1. Load brand profile
        const brandSnap = await getDoc(
          doc(db, "brandProfiles", user.uid)
        );

        if (!brandSnap.exists()) {
          throw new Error("Brand profile not found.");
        }

        const brandData = brandSnap.data();
        setBrand(brandData);

        // 2. Load influencers
        const influencerSnap = await getDocs(
          collection(db, "influencerProfiles")
        );

        const influencers = influencerSnap.docs.map((profileDoc) => ({
          id: profileDoc.id,
          ...profileDoc.data(),
        }));

        // 3. Calculate match score
        const scoredInfluencers = influencers.map((influencer) => {
          let nicheScore = 0;
          let budgetScore = 0;
          let locationScore = 0;
          let followerScore = 0;

          // -------------------------
          // NICHE SCORE — MAX 35
          // -------------------------

          if (influencer.niche === brandData.niche) {
            nicheScore = 35;
          }

          // -------------------------
          // BUDGET SCORE — MAX 25
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
          // LOCATION SCORE — MAX 25
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

          // Same city
          if (
            brandCity &&
            influencerCity &&
            brandCity === influencerCity
          ) {
            locationScore = 25;
          }

          // Same state
          else if (
            brandState &&
            influencerState &&
            brandState === influencerState
          ) {
            locationScore = 18;
          }

          // Different state
          else {
            locationScore = 5;
          }

          // -------------------------
          // FOLLOWER SCORE — MAX 15
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

          // -------------------------
          // FINAL SCORE
          // -------------------------

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

        // 4. Highest score first
        scoredInfluencers.sort(
          (a, b) => b.matchScore - a.matchScore
        );

        setMatches(scoredInfluencers);
      } catch (err) {
        console.error("Error finding matches:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [user]);

  if (!user || loading) {
    return <p>Finding your best matches...</p>;
  }

  return (
    <div>
      <h2>Recommended Influencers</h2>

      {error && <p>{error}</p>}

      {brand && (
        <div>
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
            Campaign Budget:{" "}
            <strong>₹{brand.budget}</strong>
          </p>

          <hr />
        </div>
      )}

      {matches.length === 0 ? (
        <p>No influencers found.</p>
      ) : (
        matches.map((influencer, index) => (
          <div key={influencer.id}>
            <h3>
              #{index + 1} {influencer.name}
            </h3>

            <h4>
              Match Score: {influencer.matchScore}%
            </h4>

            <p>Niche: {influencer.niche}</p>

            <p>Location: {influencer.location}</p>

            <p>
              Followers: {influencer.followerRange}
            </p>

            <p>Rate: ₹{influencer.rate}</p>

            <p>{influencer.bio}</p>

            <p>
              Niche Score:{" "}
              {influencer.scoreBreakdown.niche}/35
            </p>

            <p>
              Budget Score:{" "}
              {influencer.scoreBreakdown.budget}/25
            </p>

            <p>
              Location Score:{" "}
              {influencer.scoreBreakdown.location}/25
            </p>

            <p>
              Follower Score:{" "}
              {influencer.scoreBreakdown.followers}/15
            </p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}