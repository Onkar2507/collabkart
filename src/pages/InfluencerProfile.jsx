import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
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
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  if (!user) {
    return <p>Loading...</p>;
  }

  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSaved(false);

    try {
      await setDoc(doc(db, "influencerProfiles", user.uid), {
        uid: user.uid,
        name,
        niche,
        location,
        followerRange,
        bio,
        rate: Number(rate),
        updatedAt: serverTimestamp(),
      });

      console.log("Profile saved:", user.uid);
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Influencer Profile</h2>

      {saved && <p>Profile saved successfully!</p>}

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

      {error && <p>{error}</p>}
    </div>
  );
}