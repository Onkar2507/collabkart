import Matches from "./pages/Matches";
import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/Chat";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import InfluencerProfile from "./pages/InfluencerProfile";
import BrandProfile from "./pages/BrandProfile";
import BrowseInfluencers from "./pages/BrowseInfluencers";
import IncomingRequests from "./pages/IncomingRequests";
import MyRequests from "./pages/MyRequests";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />

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

        <Route
          path="/incoming-requests"
          element={<IncomingRequests />}
        />

        <Route
          path="/my-requests"
          element={<MyRequests />}
        />

        <Route path="/matches" element={<Matches />} />

        <Route path="/chat/:requestId" element={<Chat />} />
      </Routes>
    </>
  );
}

export default App;
