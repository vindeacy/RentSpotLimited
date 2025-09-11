import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function PropertyListing({ title = "Featured Rentals", limit = 3 }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch("http://localhost:5000/api/properties");
        const data = await res.json();
        setProperties(data.properties || []);
      } catch (err) {
        setProperties([]);
      }
      setLoading(false);
    }
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  const displayed = limit ? properties.slice(0, limit) : properties;

  return (
    <section className="py-5 bg-light">
      <Container>
        <h2 className="text-center fw-bold mb-4">{title}</h2>
        <Row className="g-4">
          {displayed.length === 0 && (
            <Col>
              <p className="text-center text-muted">No properties found.</p>
            </Col>
          )}
          {displayed.map((property) => (
            <Col md={4} key={property.id}>
              <Card className="shadow-sm border-0 rounded-3 h-100">
                <Card.Img
                  variant="top"
                  src={property.images?.[0]?.url || `https://source.unsplash.com/400x250/?house,home&sig=${property.id}`}
                  alt={property.title}
                />
                <Card.Body>
                  <Card.Title>{property.title}</Card.Title>
                  <Card.Text>
                    {property.description?.slice(0, 80)}...
                    <br />
                    <strong>Price:</strong> {property.price} {property.currency}
                    <br />
                    <strong>Location:</strong> {property.city}, {property.country}
                  </Card.Text>
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}