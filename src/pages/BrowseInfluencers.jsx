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

const NICHES = [
  "All",
  "Food",
  "Fashion",
  "Tech",
  "Fitness",
  "Travel",
  "Beauty",
  "Gaming",
  "Education",
  "Lifestyle",
  "Other",
];

export default function BrowseInfluencers() {
  const { user } = useAuth();

  const [influencers, setInfluencers] = useState([]);
  const [ratingsByInfluencer, setRatingsByInfluencer] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("All");
  const [maxRate, setMaxRate] = useState("");

  const [sendingId, setSendingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadInfluencers = async () => {
      try {
        const [querySnapshot, ratings] = await Promise.all([
          getDocs(collection(db, "influencerProfiles")),
          getRatingsByInfluencer(),
        ]);

        const influencerList = querySnapshot.docs.map((profileDoc) => ({
          id: profileDoc.id,
          ...profileDoc.data(),
        }));

        setInfluencers(influencerList);
        setRatingsByInfluencer(ratings);
      } catch (err) {
        console.error("Error loading influencers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadInfluencers();
  }, []);

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

      const userData = userSnap.data();

      if (userData.role !== "brand") {
        throw new Error(
          "Only brand accounts can send collaboration requests."
        );
      }

      const brandSnap = await getDoc(
        doc(db, "brandProfiles", user.uid)
      );

      if (!brandSnap.exists()) {
        throw new Error(
          "Please create your brand profile before sending requests."
        );
      }

      const brandData = brandSnap.data();

      const existingRequests = await getDocs(
        query(
          collection(db, "requests"),
          where("brandId", "==", user.uid),
          where("influencerId", "==", influencer.uid)
        )
      );

      const hasActiveRequest = existingRequests.docs.some(
        (requestDoc) => {
          const status = requestDoc.data().status;

          return (
            status === "pending" ||
            status === "accepted"
          );
        }
      );

      if (hasActiveRequest) {
        throw new Error(
          "You already have an active request with this influencer."
        );
      }

      await addDoc(collection(db, "requests"), {
        brandId: user.uid,
        influencerId: influencer.uid,

        brandName: brandData.companyName,
        influencerName: influencer.name,

        message: message.trim(),
        status: "pending",

        createdAt: serverTimestamp(),
      });

      setSuccess(
        `Request sent to ${influencer.name}.`
      );

      setMessage("");
    } catch (err) {
      console.error("Error sending request:", err);
      setError(err.message);
    } finally {
      setSendingId(null);
    }
  };

  const filteredInfluencers = influencers.filter(
    (influencer) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        influencer.name
          ?.toLowerCase()
          .includes(searchText) ||
        influencer.location
          ?.toLowerCase()
          .includes(searchText);

      const matchesNiche =
        niche === "All" ||
        influencer.niche === niche;

      const matchesRate =
        maxRate === "" ||
        Number(influencer.rate) <= Number(maxRate);

      return (
        matchesSearch &&
        matchesNiche &&
        matchesRate
      );
    }
  );

  if (loading) {
    return (
      <main className="page-container">
        <div className="dashboard-loading">
          Loading creators...
        </div>
      </main>
    );
  }

  return (
    <main className="page-container discover-page">

      {/* Header */}

      <header className="discover-header">
        <div>
          <span className="dashboard-eyebrow">
            CREATOR DISCOVERY
          </span>

          <h1>Discover Creators</h1>

          <p>
            Find influencers that fit your campaign,
            audience and budget.
          </p>
        </div>

        <div className="discover-count">
          <strong>
            {filteredInfluencers.length}
          </strong>

          <span>
            {filteredInfluencers.length === 1
              ? "creator found"
              : "creators found"}
          </span>
        </div>
      </header>


      {/* Search and Filters */}

      <section className="discover-filters card">

        <div className="discover-search-field">
          <label htmlFor="creator-search">
            Search creators
          </label>

          <div className="discover-input-wrap">
            <span>⌕</span>

            <input
              id="creator-search"
              type="text"
              placeholder="Search by name or location"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>


        <div className="discover-filter-field">
          <label htmlFor="creator-niche">
            Niche
          </label>

          <select
            id="creator-niche"
            value={niche}
            onChange={(e) =>
              setNiche(e.target.value)
            }
          >
            {NICHES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>


        <div className="discover-filter-field">
          <label htmlFor="creator-rate">
            Maximum Rate
          </label>

          <input
            id="creator-rate"
            type="number"
            placeholder="₹ Any budget"
            value={maxRate}
            onChange={(e) =>
              setMaxRate(e.target.value)
            }
          />
        </div>

      </section>


      {/* Collaboration Message */}

      <section className="collaboration-message-box card">

        <div className="collaboration-message-header">
          <div>
            <h2>Collaboration Message</h2>

            <p>
              This message will be sent with your
              collaboration request.
            </p>
          </div>

          <span>
            {message.length} characters
          </span>
        </div>

        <textarea
          placeholder="Tell creators about your campaign, deliverables and what you're looking for..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          rows={3}
        />

      </section>


      {/* Messages */}

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


      {/* Creator Results */}

      <section className="discover-results">

        <div className="discover-results-header">
          <div>
            <h2>Creators</h2>

            <p>
              Browse profiles and send collaboration
              requests directly.
            </p>
          </div>
        </div>


        {filteredInfluencers.length === 0 ? (

          <div className="dashboard-empty card">

            <div className="dashboard-empty-icon">
              ⌕
            </div>

            <h3>No creators found</h3>

            <p>
              Try changing your search, niche or
              maximum rate.
            </p>

          </div>

        ) : (

          <div className="discover-creator-grid">

            {filteredInfluencers.map(
              (influencer) => {
                const rating =
                  ratingsByInfluencer[
                    influencer.uid ||
                      influencer.id
                  ];

                const initial =
                  (influencer.name || "C")
                    .charAt(0)
                    .toUpperCase();

                return (

                  <article
                    className="discover-creator-card card"
                    key={influencer.id}
                  >

                    <div className="discover-card-top">

                      <div className="discover-creator-identity">

                        <div className="discover-creator-avatar">
                          {initial}
                        </div>

                        <div>
                          <h3>
                            {influencer.name}
                          </h3>

                          <span>
                            {influencer.niche ||
                              "Creator"}
                          </span>
                        </div>

                      </div>


                      <div className="discover-rating">
                        {rating ? (
                          <>
                            <strong>
                              ★{" "}
                              {rating.average.toFixed(
                                1
                              )}
                            </strong>

                            <span>
                              {rating.count}{" "}
                              {rating.count === 1
                                ? "review"
                                : "reviews"}
                            </span>
                          </>
                        ) : (
                          <>
                            <strong>New</strong>
                            <span>
                              No reviews yet
                            </span>
                          </>
                        )}
                      </div>

                    </div>


                    <p className="discover-bio">
                      {influencer.bio ||
                        "This creator hasn't added a bio yet."}
                    </p>


                    <div className="discover-meta">

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
                        <span>Rate</span>
                        <strong>
                          ₹{influencer.rate || "—"}
                        </strong>
                      </div>

                    </div>


                    <button
                      type="button"
                      className="btn btn-primary discover-request-button"
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

                  </article>

                );
              }
            )}

          </div>

        )}

      </section>

    </main>
  );
}