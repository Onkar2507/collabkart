import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function HomeRedirect() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === "brand") {
    return <Navigate to="/dashboard/brand" replace />;
  }

  if (role === "influencer") {
    return <Navigate to="/dashboard/influencer" replace />;
  }

  return <Navigate to="/login" replace />;
}
