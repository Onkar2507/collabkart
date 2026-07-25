import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Landing from "../pages/Landing";

export default function HomeRedirect() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="landing-loading">
        Loading CollabKart...
      </div>
    );
  }

  // Public visitor → show landing page
  if (!user) {
    return <Landing />;
  }

  // Logged-in brand → brand dashboard
  if (role === "brand") {
    return (
      <Navigate
        to="/dashboard/brand"
        replace
      />
    );
  }

  // Logged-in creator → creator dashboard
  if (role === "influencer") {
    return (
      <Navigate
        to="/dashboard/influencer"
        replace
      />
    );
  }

  // Logged in but role still unavailable
  return (
    <div className="landing-loading">
      Loading your workspace...
    </div>
  );
}