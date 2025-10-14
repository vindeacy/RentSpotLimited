import React from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { 
  useGetFeaturedPropertiesQuery, 
  useGetPropertiesQuery, 
  useGetPublicPropertiesQuery 
} from '../store/api/propertiesApi';

const PropertyListing = ({ 
  title = "Properties", 
  limit, 
  searchParams, 
  isPublic = false 
}) => {
  // Choose the appropriate query based on whether it's public or authenticated
  const {
    data: properties,
    isLoading,
    error
  } = (() => {
    if (searchParams) {
      // For search results, use public or authenticated based on isPublic flag
      return isPublic 
        ? useGetPublicPropertiesQuery(searchParams)
        : useGetPropertiesQuery(searchParams);
    } else {
      // For featured properties, always use public endpoint
      return useGetFeaturedPropertiesQuery(limit);
    }
  })();

  if (isLoading) {
    return (
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5 fw-bold">{title}</h2>
          <div className="text-center">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading properties...</span>
            </Spinner>
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    console.error('Property fetch error:', error);
    return (
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5 fw-bold">{title}</h2>
          <Alert variant="warning" className="text-center">
            <Alert.Heading>Properties Coming Soon!</Alert.Heading>
            <p>We're working hard to bring you the best rental properties. Check back soon!</p>
            {process.env.NODE_ENV === 'development' && (
              <small className="text-muted">
                Debug: {error.data?.message || error.message || 'API connection issue'}
              </small>
            )}
          </Alert>
        </Container>
      </section>
    );
  }

  const propertyList = properties?.properties || properties || [];

  if (propertyList.length === 0) {
    return (
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5 fw-bold">{title}</h2>
          <Alert variant="info" className="text-center">
            <Alert.Heading>No Properties Available</Alert.Heading>
            <p>No properties found. Check back later for new listings!</p>
            <Button variant="outline-primary" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </Alert>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-5 bg-light">
      <Container>
        <h2 className="text-center mb-5 fw-bold">{title}</h2>
        <Row>
          {propertyList.map((property) => (
            <Col key={property._id} lg={4} md={6} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Img
                  variant="top"
                  src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=500&q=80'}
                  alt={property.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fw-bold">{property.title}</Card.Title>
                  <Card.Text className="text-muted mb-2">
                    📍 {property.location?.city || property.city}, {property.location?.country || property.country}
                  </Card.Text>
                  <Card.Text className="text-truncate mb-3">
                    {property.description}
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-bold text-primary fs-5">
                        ${property.rent || property.price}/month
                      </span>
                      <span className="badge bg-secondary">
                        {property.type}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between text-muted small mb-3">
                      <span>🛏️ {property.bedrooms || 'N/A'} beds</span>
                      <span>🚿 {property.bathrooms || 'N/A'} baths</span>
                      <span>📐 {property.area || 'N/A'} sq ft</span>
                    </div>
                    <Button 
                      variant="primary" 
                      className="w-100"
                      onClick={() => window.location.href = `/property/${property._id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default PropertyListing;