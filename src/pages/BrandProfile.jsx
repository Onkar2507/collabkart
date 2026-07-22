import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

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

export default function BrandProfile() {
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [niche, setNiche] = useState("Food");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [goals, setGoals] = useState("");

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing brand profile
  useEffect(() => {
    if (!user) {
      return;
    }

    const loadProfile = async () => {
      try {
        const profileRef = doc(
          db,
          "brandProfiles",
          user.uid
        );

        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data();

          setCompanyName(data.companyName || "");
          setNiche(data.niche || "Food");
          setLocation(data.location || "");
          setBudget(data.budget?.toString() || "");
          setGoals(data.goals || "");
        }
      } catch (err) {
        console.error("Error loading brand profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (!user || loading) {
    return <p>Loading...</p>;
  }

  // Create or update brand profile
  const handleSave = async (e) => {
    e.preventDefault();

    setError("");
    setSaved(false);

    try {
      await setDoc(doc(db, "brandProfiles", user.uid), {
        uid: user.uid,
        companyName,
        niche,
        location,
        budget: Number(budget),
        goals,
        updatedAt: serverTimestamp(),
      });

      console.log("Brand profile saved:", user.uid);
      setSaved(true);
    } catch (err) {
      console.error("Error saving brand profile:", err);
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Brand Profile</h2>

      {saved && <p>Profile saved successfully!</p>}

      <form onSubmit={handleSave}>
        <input
          type="text"
          placeholder="Company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
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
          placeholder="City, State (e.g. Pune, Maharashtra)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <br />
        <br />

        <input
          type="number"
          placeholder="Campaign budget (₹)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          min="1"
          required
        />

        <br />
        <br />

        <textarea
          placeholder="What are your campaign goals?"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          rows={4}
          required
        />

        <br />
        <br />

        <button type="submit">
          Save Profile
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}