import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import PropertyListing from "../component/PropertyListing";

export default function HomePage() {
  const navigate = useNavigate();

  function handleAuthClick() {
    const token = localStorage.getItem('token');
    if (token) {
      navigate("/login");
    } else {
      navigate("/register");
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section
        className="text-white text-center d-flex align-items-center"
        style={{
          minHeight: "90vh",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container>
          <h1 className="display-4 fw-bold">Find Your Perfect Rental Home</h1>
          <p className="lead mb-4">
            Browse verified houses, apartments, and storage spaces tailored for
            your lifestyle.
          </p>
          <Button size="lg" variant="warning" className="fw-semibold">
            Start Exploring
          </Button>
          {/* Top-right button */}
          <div
            style={{
              position: "absolute",
              top: 30,
              right: 40,
              zIndex: 10,
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleAuthClick}
              className="fw-semibold"
            >
              Sign Up
            </Button>
          </div>
        </Container>
      </section>

      {/* Featured Listings - fetched from backend */}
      <PropertyListing title="Featured Rentals" limit={3} />

      {/* Why Choose Us */}
      <section className="py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <img
                src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80"
                alt="Comfortable Living"
                className="img-fluid rounded-3 shadow-sm"
              />
            </Col>
            <Col md={6}>
              <h2 className="fw-bold mb-3">Why Choose RentSpot?</h2>
              <p className="mb-4 text-muted">
                We make house hunting simple and stress-free. Get access to
                thousands of verified rental properties with transparent pricing
                and trusted landlords.
              </p>
              <ul className="list-unstyled">
                <li className="mb-2">✔ Verified rental listings</li>
                <li className="mb-2">✔ Secure tenant–landlord connections</li>
                <li className="mb-2">✔ Easy online booking</li>
              </ul>
              <Button variant="success" size="lg">
                Get Started
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}