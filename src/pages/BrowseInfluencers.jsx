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

  // Load all influencers
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

  // Send collaboration request
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
      // Get logged-in user's account information
      const userSnap = await getDoc(
        doc(db, "users", user.uid)
      );

      if (!userSnap.exists()) {
        throw new Error("User account not found.");
      }

      const userData = userSnap.data();

      // Only brands should send collaboration requests
      if (userData.role !== "brand") {
        throw new Error(
          "Only brand accounts can send collaboration requests."
        );
      }

      // Get brand profile so we can store company name
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

      const hasActiveRequest = existingRequests.docs.some((requestDoc) => {
        const status = requestDoc.data().status;
        return status === "pending" || status === "accepted";
      });

      if (hasActiveRequest) {
        throw new Error("You already have an active request with this influencer.");
      }

      // Create a new request document
      await addDoc(collection(db, "requests"), {
        brandId: user.uid,
        influencerId: influencer.uid,

        brandName: brandData.companyName,
        influencerName: influencer.name,

        message: message.trim(),
        status: "pending",

        createdAt: serverTimestamp(),
      });

      setSuccess(`Request sent to ${influencer.name}.`);

      setMessage("");
    } catch (err) {
      console.error("Error sending request:", err);
      setError(err.message);
    } finally {
      setSendingId(null);
    }
  };

  // Search + filters
  const filteredInfluencers = influencers.filter((influencer) => {
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
  });

  if (loading) {
    return <p>Loading influencers...</p>;
  }

  return (
    <div>
      <h2>Browse Influencers</h2>

      <input
        type="text"
        placeholder="Search by name or location"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <br />
      <br />

      <select
        value={niche}
        onChange={(e) => setNiche(e.target.value)}
      >
        {NICHES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <br />
      <br />

      <input
        type="number"
        placeholder="Maximum rate (₹)"
        value={maxRate}
        onChange={(e) => setMaxRate(e.target.value)}
      />

      <br />
      <br />

      <textarea
        placeholder="Collaboration message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
      />

      <hr />

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}

      {filteredInfluencers.length === 0 ? (
        <p>No influencers found.</p>
      ) : (
        filteredInfluencers.map((influencer) => (
          <div key={influencer.id}>
            <h3>{influencer.name}</h3>

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

            <p>Bio: {influencer.bio}</p>

            <p>Rate: ₹{influencer.rate}</p>

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
