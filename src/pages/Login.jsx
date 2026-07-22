import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      // Step 1: Login with Firebase Authentication
      const cred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("Logged In:", cred.user.uid);

      // Step 2: Get user document from Firestore
      const userRef = doc(db, "users", cred.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("User profile not found.");
        return;
      }

      // Step 3: Get the user's role
      const userData = userSnap.data();
      const role = userData.role;

      console.log("User Role:", role);

      // Step 4: Redirect based on role
      if (role === "influencer") {
        navigate("/profile/influencer");
      } else if (role === "brand") {
        navigate("/profile/brand");
      } else {
        setError("Invalid user role.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br />
        <br />

        <button type="submit">
          Login
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
}