import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PropertySearch from "./PropertySearch"; // Import your search component

export default function PropertyDetails() {
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch("http://localhost:5000/api/properties");
        const data = await res.json();
        setProperties(data.properties || []);
        setFiltered(data.properties || []);
      } catch (err) {
        setProperties([]);
        setFiltered([]);
      }
      setLoading(false);
    }
    fetchProperties();
  }, []);

  // Handler for search/filter
  function handleSearch(query) {
    if (!query) {
      setFiltered(properties);
      return;
    }
    const lower = query.toLowerCase();
    setFiltered(
      properties.filter(
        p =>
          p.title?.toLowerCase().includes(lower) ||
          p.city?.toLowerCase().includes(lower) ||
          p.country?.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower)
      )
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <section className="py-5 bg-light">
      <Container>
        <h2 className="text-center fw-bold mb-4">Featured Rentals</h2>
        <PropertySearch onSearch={handleSearch} />
        <Row className="g-4 mt-3">
          {filtered.length === 0 && (
            <Col>
              <p className="text-center text-muted">No properties found.</p>
            </Col>
          )}
          {filtered.map((property) => (
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