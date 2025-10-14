import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./Constants/header.jsx";
import Footer from "./Constants/footer.jsx";
import LandingPage from "./hero/landingPage.jsx";
import Login from "./user/login.jsx";
import Register from "./user/register.jsx";
import Faqs from "./component/Faqs.jsx";
import ContactUs from "./contact/ContactUs.jsx";
// Tenant Dashboard and related pages
import Dashboard from "./pages/TenantDashboard/Dashboard.jsx";
// Landlord Dashboard
import LandlordDashboard from "./pages/LandlordDahboard/dashboard.jsx";
import PropertyListing from "./component/PropertyListing.jsx";
import PropertySearch from "./pages/LandlordDahboard/PropertySearch.jsx";

function AppContent() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.includes("dashboard");

  return (
    <>
      {!isDashboardRoute && <Header />}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <LandingPage />
              <Faqs />
              <ContactUs />
            </>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Dashboard route: sidebar navigation handles profile/properties */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Landlord Dashboard route: sidebar navigation handles all landlord features */}
        <Route path="/landlord-dashboard" element={<LandlordDashboard />} />
        {/* Property routes */}
        <Route path="/properties" element={<PropertyListing />} />
        {/* Property search (optional as a separate page) */}
        <Route path="/property-search" element={<PropertySearch />} />
        {/* Profile route (optional, but not needed if using dashboard sidebar) */}
        {/* <Route path="/profile" element={<Profile />} /> */}
      </Routes>
      {!isDashboardRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;