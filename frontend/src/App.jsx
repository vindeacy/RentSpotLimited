import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./Constants/header.jsx";
import Footer from "./Constants/footer.jsx";
import LandingPage from "./hero/landingPage.jsx";
import Login from "./user/login.jsx";
import Register from "./user/register.jsx";
import Faqs from "./component/Faqs.jsx";
import ContactUs from "./contact/ContactUs.jsx";
// Tenant Dashboard and related pages
import Dashboard from "./pages/TenantDashboard/Dashboard.jsx";
import PropertyListing from "./component/PropertyListing.jsx";
import PropertyDetails from "./pages/TenantDashboard/PropertyDetails.jsx";
import PropertySearch from "./pages/TenantDashboard/PropertySearch.jsx";
// import Profile from "./pages/TenantDashboard/profile.jsx";

function App() {
  return (
    <>
      <Header />
      <BrowserRouter>
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
          {/* Property listing and details (if you want separate pages) */}
          <Route path="/properties" element={<PropertyListing />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          {/* Property search (optional as a separate page) */}
          <Route path="/property-search" element={<PropertySearch />} />
          {/* Profile route (optional, but not needed if using dashboard sidebar) */}
          {/* <Route path="/profile" element={<Profile />} /> */}
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
}

export default App;