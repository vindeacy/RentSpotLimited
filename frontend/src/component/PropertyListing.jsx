import React from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { 
  useGetFeaturedPropertiesQuery, 
  useGetPropertiesQuery, 
  useGetPublicPropertiesQuery 
} from '../store/api/propertiesApi';

const PropertyListing = ({ 
  title = "Properties", 
  limit = 3, 
  searchParams = null, 
  isPublic = false 
}) => {
  
  // HOOKS MUST BE AT THE TOP LEVEL
  // We use the 'skip' option to only run the query we actually need
  
  // 1. Query for Featured (Landing Page)
  const featuredRes = useGetFeaturedPropertiesQuery(limit, { 
    skip: !!searchParams 
  });

  // 2. Query for Search Results (Public)
  const publicSearchRes = useGetPublicPropertiesQuery(searchParams, { 
    skip: !searchParams || !isPublic 
  });

  // 3. Query for Search Results (Authenticated/Landlord)
  const privateSearchRes = useGetPropertiesQuery(searchParams, { 
    skip: !searchParams || isPublic 
  });

  // Determine which result set to use based on logic
  const { data, isLoading, error } = searchParams 
    ? (isPublic ? publicSearchRes : privateSearchRes) 
    : featuredRes;

  // Prisma returns an object { properties: [...] }, handle that here
  const propertyList = data?.properties || [];

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
    return (
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5 fw-bold">{title}</h2>
          <Alert variant="warning" className="text-center">
            <Alert.Heading>Properties Coming Soon!</Alert.Heading>
            <p>We're working hard to bring you the best rental properties.</p>
            <small className="text-muted">Debug: {error.data?.error || 'Route not found'}</small>
          </Alert>
        </Container>
      </section>
    );
  }

  if (propertyList.length === 0) {
    return (
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5 fw-bold">{title}</h2>
          <Alert variant="info" className="text-center">
            <Alert.Heading>No Properties Found</Alert.Heading>
            <p>Try adjusting your search filters.</p>
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
            <Col key={property.id} lg={4} md={6} className="mb-4">
              <Card className="h-100 shadow-sm border-0">
                <Card.Img
                  variant="top"
                  // Handling your PropertyImage relation
                  src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500'}
                  alt={property.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fw-bold">{property.title}</Card.Title>
                  <Card.Text className="text-muted mb-2">
                    📍 {property.city}, {property.state}
                  </Card.Text>
                  <Card.Text className="text-truncate mb-3 small">
                    {property.description}
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-bold text-primary fs-5">
                        {property.currency || '$'}{property.price?.toLocaleString()}/mo
                      </span>
                      <span className="badge bg-info text-dark">
                        {property.propertyType}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between text-muted small mb-3">
                      <span>🛏️ {property.bedrooms || 0} beds</span>
                      <span>🚿 {property.bathrooms || 0} baths</span>
                      <span>📐 {property.size || 0} sqft</span>
                    </div>
                    <Button 
                      variant="primary" 
                      className="w-100 fw-bold"
                      onClick={() => window.location.href = `/property/${property.id}`}
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