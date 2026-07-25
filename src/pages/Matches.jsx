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
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadMatches = async () => {
      try {
        const brandSnap = await getDoc(
          doc(db, "brandProfiles", user.uid)
        );

        if (!brandSnap.exists()) {
          throw new Error("Brand profile not found.");
        }

        const brandData = brandSnap.data();
        setBrand(brandData);

        const [influencerSnap, ratings] = await Promise.all([
          getDocs(collection(db, "influencerProfiles")),
          getRatingsByInfluencer(),
        ]);

        const influencers = influencerSnap.docs.map((profileDoc) => ({
          id: profileDoc.id,
          ...profileDoc.data(),
        }));

        setRatingsByInfluencer(ratings);

        const scoredInfluencers = influencers.map((influencer) => {
          let nicheScore = 0;
          let budgetScore = 0;
          let locationScore = 0;
          let followerScore = 0;

          // NICHE — MAX 35
          if (influencer.niche === brandData.niche) {
            nicheScore = 35;
          }

          // BUDGET — MAX 25
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

          // LOCATION — MAX 25
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

          // FOLLOWERS — MAX 15
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

        scoredInfluencers.sort(
          (a, b) => b.matchScore - a.matchScore
        );

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

  const getMatchLabel = (score) => {
    if (score >= 85) return "Excellent Match";
    if (score >= 70) return "Good Match";
    if (score >= 50) return "Fair Match";

    return "Low Match";
  };

  const getMatchClass = (score) => {
    if (score >= 85) return "excellent";
    if (score >= 70) return "good";
    if (score >= 50) return "fair";

    return "low";
  };

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
    setSuccess("");
    setSendingId(influencer.id);

    try {
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

      setSuccess(
        `Collaboration request sent to ${influencer.name}.`
      );

      setMessage("");
    } catch (err) {
      console.error("Error sending request:", err);
      setError(err.message);
    } finally {
      setSendingId(null);
    }
  };

  if (!user || loading) {
    return (
      <main className="page-container">
        <div className="dashboard-loading">
          Finding your best matches...
        </div>
      </main>
    );
  }

  return (
    <main className="page-container matches-page">

      {/* Header */}

      <header className="matches-header">

        <div>
          <span className="dashboard-eyebrow">
            SMART MATCHING
          </span>

          <h1>Your Best Creator Matches</h1>

          <p>
            Creators ranked using your niche, budget,
            location and audience requirements.
          </p>
        </div>

        <div className="matches-count">
          <strong>{matches.length}</strong>
          <span>top matches</span>
        </div>

      </header>


      {/* Brand Campaign Summary */}

      {brand && (
        <section className="match-brand-summary card">

          <div className="match-brand-title">
            <div className="match-brand-avatar">
              {(brand.companyName || "B")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <span>Matching for</span>
              <h2>{brand.companyName}</h2>
            </div>
          </div>


          <div className="match-brand-details">

            <div>
              <span>Niche</span>
              <strong>
                {brand.niche || "Not specified"}
              </strong>
            </div>

            <div>
              <span>Location</span>
              <strong>
                {brand.location || "Not specified"}
              </strong>
            </div>

            <div>
              <span>Budget</span>
              <strong>
                ₹{brand.budget || "—"}
              </strong>
            </div>

          </div>

        </section>
      )}


      {/* Message */}

      <section className="match-message-box card">

        <div className="collaboration-message-header">

          <div>
            <h2>Collaboration Message</h2>

            <p>
              Write the message you want to send
              with a collaboration request.
            </p>
          </div>

          <span>
            {message.length} characters
          </span>

        </div>

        <textarea
          placeholder="Tell the creator about your campaign, goals and deliverables..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          rows={3}
        />

      </section>


      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}


      {/* Match Results */}

      <section className="match-results">

        <div className="match-results-heading">
          <div>
            <h2>Recommended Creators</h2>

            <p>
              Ranked from strongest to weakest match.
            </p>
          </div>
        </div>


        {matches.length === 0 ? (

          <div className="dashboard-empty card">
            <div className="dashboard-empty-icon">
              ◇
            </div>

            <h3>No matches found</h3>

            <p>
              Update your brand profile to improve
              your creator recommendations.
            </p>
          </div>

        ) : (

          <div className="match-list">

            {matches.map((influencer, index) => {
              const rating =
                ratingsByInfluencer[
                  influencer.uid || influencer.id
                ];

              const matchClass =
                getMatchClass(
                  influencer.matchScore
                );

              const initial =
                (influencer.name || "C")
                  .charAt(0)
                  .toUpperCase();

              return (

                <article
                  className={`match-card card match-${matchClass}`}
                  key={influencer.id}
                >

                  {/* Ranking */}

                  <div className="match-rank">
                    <span>#{index + 1}</span>
                  </div>


                  {/* Creator */}

                  <div className="match-main">

                    <div className="match-card-header">

                      <div className="match-creator">

                        <div className="match-creator-avatar">
                          {initial}
                        </div>

                        <div>
                          <h3>
                            {influencer.name}
                          </h3>

                          <span>
                            {influencer.niche || "Creator"}
                          </span>
                        </div>

                      </div>


                      <div className="match-score-area">

                        <div
                          className={`match-score-circle score-${matchClass}`}
                        >
                          <strong>
                            {influencer.matchScore}%
                          </strong>

                          <span>MATCH</span>
                        </div>

                        <span
                          className={`match-quality match-quality-${matchClass}`}
                        >
                          {getMatchLabel(
                            influencer.matchScore
                          )}
                        </span>

                      </div>

                    </div>


                    {/* Bio */}

                    <p className="match-bio">
                      {influencer.bio ||
                        "This creator hasn't added a bio yet."}
                    </p>


                    {/* Creator details */}

                    <div className="match-profile-details">

                      <div>
                        <span>Location</span>
                        <strong>
                          {influencer.location ||
                            "Not specified"}
                        </strong>
                      </div>

                      <div>
                        <span>Followers</span>
                        <strong>
                          {influencer.followerRange ||
                            "Not specified"}
                        </strong>
                      </div>

                      <div>
                        <span>Rating</span>
                        <strong>
                          {rating
                            ? `★ ${rating.average.toFixed(1)}`
                            : "New"}
                        </strong>
                      </div>

                      <div>
                        <span>Rate</span>
                        <strong>
                          ₹{influencer.rate || "—"}
                        </strong>
                      </div>

                    </div>


                    {/* Score Breakdown */}

                    <div className="score-breakdown">

                      <div className="score-breakdown-title">
                        <strong>
                          Why this match?
                        </strong>

                        <span>
                          Score breakdown
                        </span>
                      </div>


                      <div className="score-breakdown-grid">

                        <ScoreItem
                          label="Niche"
                          score={
                            influencer.scoreBreakdown.niche
                          }
                          max={35}
                        />

                        <ScoreItem
                          label="Budget"
                          score={
                            influencer.scoreBreakdown.budget
                          }
                          max={25}
                        />

                        <ScoreItem
                          label="Location"
                          score={
                            influencer.scoreBreakdown.location
                          }
                          max={25}
                        />

                        <ScoreItem
                          label="Followers"
                          score={
                            influencer.scoreBreakdown.followers
                          }
                          max={15}
                        />

                      </div>

                    </div>


                    {/* Footer */}

                    <div className="match-card-footer">

                      <span className="match-review-info">
                        {rating
                          ? `${rating.count} ${
                              rating.count === 1
                                ? "review"
                                : "reviews"
                            }`
                          : "No reviews yet"}
                      </span>


                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                          handleSendRequest(
                            influencer
                          )
                        }
                        disabled={
                          sendingId === influencer.id
                        }
                      >
                        {sendingId === influencer.id
                          ? "Sending..."
                          : "Send Collaboration Request"}
                      </button>

                    </div>

                  </div>

                </article>

              );
            })}

          </div>

        )}

      </section>

    </main>
  );
}


/* Reusable score item */

function ScoreItem({ label, score, max }) {
  const percentage =
    max > 0 ? (score / max) * 100 : 0;

  return (
    <div className="score-item">

      <div className="score-item-heading">
        <span>{label}</span>

        <strong>
          {score}/{max}
        </strong>
      </div>

      <div className="score-track">
        <div
          className="score-fill"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

    </div>
  );
}