import  { useState } from "react";
import { Row, Col } from "react-bootstrap";
import Profile from "./profile.jsx";
import PropertyDetails from "./PropertyDetails.jsx";
// import Reviews from "./Reviews.jsx"; // Uncomment if you have a Reviews component

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: "bi-house-door-fill" },
  { key: "profile", label: "Profile", icon: "bi-person-fill" },
  { key: "properties", label: "My Properties", icon: "bi-building" },
  // { key: "reviews", label: "Reviews", icon: "bi-star-fill" }, // Uncomment if you have reviews
  { key: "settings", label: "Settings", icon: "bi-gear-fill" },
  { key: "logout", label: "Logout", icon: "bi-box-arrow-right" },
];

const workOrders = [
  { id: 1, tenant: "John Smith", company: "Bills plumbing", issue: "Leaky kitchen sink", status: "Contacted", date: "21/04/24", time: "11:32 AM" },
  { id: 2, tenant: "Wade Warren", company: "Estep electric", issue: "Bedroom lights flickering", status: "Pending", date: "18/03/24", time: "10:02 AM" },
  { id: 3, tenant: "Jenny Wilson", company: "Bills plumbing", issue: "Clogged toilet", status: "Waiting", date: "02/03/24", time: "01:24 PM" },
  
];

const tenantCalls = [
  { id: "#3435", customer: "Adam Smith", time: 10 },
  { id: "#2345", customer: "Esther Howard", time: 8 },
  { id: "#4356", customer: "Jenny Wilson", time: 8 },
  
];

export default function Dashboard() {
  const [active, setActive] = useState("dashboard");

  function renderContent() {
    switch (active) {
      case "dashboard":
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold">Welcome, Deacy Vincensher!!</h2>
              <div className="d-flex align-items-center gap-3">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="profile" className="rounded-circle" width={40} height={40} />
                <span className="fw-semibold">deacyvin@gmail.com</span>
              </div>
            </div>
            <Row>
              <Col md={8}>
                <div className="bg-white rounded shadow-sm p-3 mb-4">
                  <h5 className="mb-3">Active work orders</h5>
                  <table className="table table-sm table-hover align-middle">
                    <thead>
                      <tr>
                        <th>SL</th>
                        <th>Tenant Name</th>
                        <th>Company Name</th>
                        <th>Issue</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workOrders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id.toString().padStart(2, "0")}</td>
                          <td>{order.tenant}</td>
                          <td>{order.company}</td>
                          <td>{order.issue}</td>
                          <td>
                            <span
                              className={`badge ${
                                order.status === "Pending"
                                  ? "bg-warning text-dark"
                                  : order.status === "Contacted"
                                  ? "bg-info text-dark"
                                  : "bg-secondary"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>{order.date}</td>
                          <td>{order.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Row>
                  <Col md={6}>
                    <div className="bg-white rounded shadow-sm p-3 mb-4">
                      <h6>Repair call stats</h6>
                      {/* Chart placeholder */}
                      <div className="text-muted text-center py-4">[Monthly Chart Here]</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="bg-white rounded shadow-sm p-3 mb-4">
                      <h6>Issue breakdown</h6>
                      {/* Chart placeholder */}
                      <div className="text-muted text-center py-4">[Issue Breakdown Chart]</div>
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col md={4}>
                <div className="bg-white rounded shadow-sm p-3 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6>
                      <i className="bi bi-telephone-fill text-primary me-2"></i>
                      Tenant calls
                    </h6>
                    <span className="badge bg-light text-dark">Monthly</span>
                  </div>
                  <table className="table table-sm table-hover align-middle">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantCalls.map((call) => (
                        <tr key={call.id}>
                          <td>{call.id}</td>
                          <td>{call.customer}</td>
                          <td>{call.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Col>
            </Row>
          </div>
        );
      case "profile":
        return <Profile />;
      case "properties":
        return <PropertyDetails />;
      // case "reviews":
      //   return <Reviews />;
      case "settings":
        return <div className="bg-white rounded shadow-sm p-4">Settings page (coming soon)</div>;
      case "logout":
        // Add your logout logic here
        return <div className="bg-white rounded shadow-sm p-4">You have been logged out.</div>;
      default:
        return null;
    }
  }

  return (
    <div style={{ minHeight: "90vh", background: "#ede7f6" }}>
      <div className="d-flex" style={{ height: "100%" }}>
        {/* Sidebar */}
        <div
          className="bg-white p-4 border-end"
          style={{
            minWidth: "220px",
            height: "100%",
            boxShadow: "0 0 10px rgba(0,0,0,0.05)",
            background: "#ede7f6",
          }}
        >
          <h4 className="mb-4 fw-bold">
            <i className="bi bi-house-door-fill me-2"></i>Property
          </h4>
          <ul className="nav flex-column">
            {sidebarItems.map((item) => (
              <li key={item.key} className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center gap-2 ${
                    active === item.key ? "active bg-primary text-white" : "text-dark"
                  }`}
                  style={{
                    border: "none",
                    background: active === item.key ? "#7c4dff" : "none",
                    fontWeight: active === item.key ? "bold" : "normal",
                    borderRadius: "6px",
                    padding: "10px 15px",
                    cursor: "pointer",
                  }}
                  onClick={() => setActive(item.key)}
                >
                  <i className={`bi ${item.icon}`}></i>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Main Content */}
        <div className="flex-grow-1 p-4">{renderContent()}</div>
      </div>
    </div>
  );
}