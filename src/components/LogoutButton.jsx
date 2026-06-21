import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut(auth);

      console.log("Logged Out");

      alert("Logout Successful!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}