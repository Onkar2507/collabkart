import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const NICHES = [
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

const FOLLOWER_RANGES = [
  "1k-10k",
  "10k-50k",
  "50k-100k",
  "100k-500k",
  "500k+",
];

export default function InfluencerProfile() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [niche, setNiche] = useState("Food");
  const [location, setLocation] = useState("");
  const [followerRange, setFollowerRange] = useState("10k-50k");
  const [bio, setBio] = useState("");
  const [rate, setRate] = useState("");

  if (!user) {
    return <p>Loading...</p>;
  }

  const handleSave = (e) => {
    e.preventDefault();

    console.log("Form values:", {
      name,
      niche,
      location,
      followerRange,
      bio,
      rate,
    });
  };

  return (
    <div>
      <h2>Influencer Profile</h2>

      <form onSubmit={handleSave}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
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
          type="text"
          placeholder="City, State"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <br />
        <br />

        <select
          value={followerRange}
          onChange={(e) => setFollowerRange(e.target.value)}
        >
          {FOLLOWER_RANGES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <br />
        <br />

        <textarea
          placeholder="Tell brands about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          required
        />

        <br />
        <br />

        <input
          type="number"
          placeholder="Rate per post (₹)"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          required
        />

        <br />
        <br />

        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}