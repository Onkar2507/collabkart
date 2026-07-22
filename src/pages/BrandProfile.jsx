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

export default function BrandProfile() {
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [niche, setNiche] = useState("Food");
  const [budget, setBudget] = useState("");
  const [goals, setGoals] = useState("");
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
      await setDoc(doc(db, "brandProfiles", user.uid), {
        uid: user.uid,
        companyName,
        niche,
        budget: Number(budget),
        goals,
        updatedAt: serverTimestamp(),
      });

      console.log("Brand profile saved:", user.uid);
      setSaved(true);
    } catch (err) {
      console.error(err);
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
          type="number"
          placeholder="Campaign budget (₹)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
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

        <button type="submit">Save Profile</button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}