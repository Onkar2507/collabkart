import Matches from "./pages/Matches";
import { Routes, Route } from "react-router-dom";
import Chat from "./pages/Chat";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import InfluencerProfile from "./pages/InfluencerProfile";
import BrandProfile from "./pages/BrandProfile";
import BrowseInfluencers from "./pages/BrowseInfluencers";
import IncomingRequests from "./pages/IncomingRequests";
import MyRequests from "./pages/MyRequests";
import Navbar from "./components/Navbar";
import HomeRedirect from "./components/HomeRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import BrandDashboard from "./pages/BrandDashboard";
import InfluencerDashboard from "./pages/InfluencerDashboard";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/profile/influencer" element={<ProtectedRoute allowedRoles={["influencer"]}><InfluencerProfile /></ProtectedRoute>} />

        <Route path="/profile/brand" element={<ProtectedRoute allowedRoles={["brand"]}><BrandProfile /></ProtectedRoute>} />

        <Route path="/influencers" element={<ProtectedRoute allowedRoles={["brand"]}><BrowseInfluencers /></ProtectedRoute>} />

        <Route path="/incoming-requests" element={<ProtectedRoute allowedRoles={["influencer"]}><IncomingRequests /></ProtectedRoute>} />

        <Route path="/my-requests" element={<ProtectedRoute allowedRoles={["brand"]}><MyRequests /></ProtectedRoute>} />

        <Route path="/matches" element={<ProtectedRoute allowedRoles={["brand"]}><Matches /></ProtectedRoute>} />

        <Route path="/chat/:requestId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

        <Route path="/dashboard/brand" element={<ProtectedRoute allowedRoles={["brand"]}><BrandDashboard /></ProtectedRoute>} />

        <Route
          path="/dashboard/influencer"
          element={<ProtectedRoute allowedRoles={["influencer"]}><InfluencerDashboard /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
