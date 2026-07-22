import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

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
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("All");
  const [maxRate, setMaxRate] = useState("");

  useEffect(() => {
    const loadInfluencers = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "influencerProfiles")
        );

        const influencerList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setInfluencers(influencerList);
      } catch (err) {
        console.error("Error loading influencers:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInfluencers();
  }, []);

  const filteredInfluencers = influencers.filter((influencer) => {
    const matchesSearch =
      influencer.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      influencer.location
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesNiche =
      niche === "All" || influencer.niche === niche;

    const matchesRate =
      maxRate === "" ||
      Number(influencer.rate) <= Number(maxRate);

    return matchesSearch && matchesNiche && matchesRate;
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

      <hr />

      {filteredInfluencers.length === 0 ? (
        <p>No influencers found.</p>
      ) : (
        filteredInfluencers.map((influencer) => (
          <div key={influencer.id}>
            <h3>{influencer.name}</h3>

            <p>Niche: {influencer.niche}</p>
            <p>Location: {influencer.location}</p>
            <p>
              Followers: {influencer.followerRange}
            </p>
            <p>Bio: {influencer.bio}</p>
            <p>Rate: ₹{influencer.rate}</p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}