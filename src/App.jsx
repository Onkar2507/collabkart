import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import InfluencerProfile from "./pages/InfluencerProfile";
import BrandProfile from "./pages/BrandProfile";
import BrowseInfluencers from "./pages/BrowseInfluencers";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      <Route
        path="/profile/influencer"
        element={<InfluencerProfile />}
      />

      <Route
        path="/profile/brand"
        element={<BrandProfile />}
      />

      <Route
        path="/influencers"
        element={<BrowseInfluencers />}
      />
    </Routes>
  );
}

export default App;