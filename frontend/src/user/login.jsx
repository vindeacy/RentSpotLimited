import { useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Card } from "react-bootstrap";
import karen from "../images/karen.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        localStorage.setItem("token", data.token);
        alert("Login successful!");
        // You can redirect here if needed
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container>
        <Row className="justify-content-center align-items-center">
          {/* Left: Login Form */}
          <Col xs={12} md={6} lg={5}>
            <Card className="shadow-lg p-4">
              <Card.Body>
                <h2 className="mb-4 text-center fw-bold">Welcome back</h2>
                <p className="mb-4 text-center text-muted">
                  Login to continue to <span className="fw-semibold text-primary">RentSpot</span>
                </p>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </Form.Group>
                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </Form>
                <div className="mt-4 text-center">
                  <span className="text-muted">Don’t have an account? </span>
                  <a href="/register" className="fw-semibold text-primary">
                    Register
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>
          {/* Right: Image */}
          <Col xs={12} md={6} lg={7} className="d-none d-md-block">
            <img
              src={karen}
              alt="Modern house"
              className="img-fluid rounded shadow"
              style={{ maxHeight: "450px", objectFit: "cover", width: "100%" }}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}