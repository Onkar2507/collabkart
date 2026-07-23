import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user, role } = useAuth();
  const homePath = user
    ? role === "brand"
      ? "/dashboard/brand"
      : "/dashboard/influencer"
    : "/login";

  return (
    <div>
      <h2>Page Not Found</h2>
      <p>The page you requested does not exist.</p>
      <Link to={homePath}>Return to the application</Link>
    </div>
  );
}
