import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const { user, role } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <nav>
      {role === "brand" && (
        <>
          <NavLink to="/profile/brand">Brand Profile</NavLink>{" "}
          <NavLink to="/influencers">Browse Influencers</NavLink>{" "}
          <NavLink to="/matches">Matches</NavLink>{" "}
          <NavLink to="/my-requests">My Requests</NavLink>{" "}
        </>
      )}

      {role === "influencer" && (
        <>
          <NavLink to="/profile/influencer">Influencer Profile</NavLink>{" "}
          <NavLink to="/incoming-requests">Incoming Requests</NavLink>{" "}
        </>
      )}

      <LogoutButton />
    </nav>
  );
}
