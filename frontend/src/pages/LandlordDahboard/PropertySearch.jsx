import { useState } from "react";
import { Form, Row, Col, Button, Container } from "react-bootstrap";
import PropertyListing from "../../component/PropertyListing";

/**
 * PropertySearch component
 * Props:
 *   onSearch: function to call with search/filter query object
 */
export default function PropertySearch() {
  const [searchParams, setSearchParams] = useState(null);
  const [formData, setFormData] = useState({
    query: "",
    city: "",
    country: "",
    type: "",
    minPrice: "",
    maxPrice: "",
  });

  function handleInputChange(field, value) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Filter out empty values
    const cleanParams = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value.trim() !== "") {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    setSearchParams(cleanParams);
  }

  function handleReset() {
    setFormData({
      query: "",
      city: "",
      country: "",
      type: "",
      minPrice: "",
      maxPrice: "",
    });
    setSearchParams(null);
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-bold">Search Properties</h2>
      
      <Form className="mb-4 p-4 bg-light rounded" onSubmit={handleSubmit}>
        <Row className="g-3">
          <Col md={6}>
            <Form.Control
              type="text"
              placeholder="Search by title or description"
              value={formData.query}
              onChange={e => handleInputChange('query', e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Control
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={e => handleInputChange('city', e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Control
              type="text"
              placeholder="Country"
              value={formData.country}
              onChange={e => handleInputChange('country', e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Select 
              value={formData.type} 
              onChange={e => handleInputChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="studio">Studio</option>
              <option value="room">Room</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Control
              type="number"
              placeholder="Min Price"
              value={formData.minPrice}
              onChange={e => handleInputChange('minPrice', e.target.value)}
              min={0}
            />
          </Col>
          <Col md={3}>
            <Form.Control
              type="number"
              placeholder="Max Price"
              value={formData.maxPrice}
              onChange={e => handleInputChange('maxPrice', e.target.value)}
              min={0}
            />
          </Col>
          <Col md={3}>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" className="flex-fill">
                Search
              </Button>
              <Button 
                type="button" 
                variant="outline-secondary" 
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      {/* Display search results or all properties - authenticated */}
      <PropertyListing 
        title={searchParams ? "Search Results" : "All Properties"} 
        searchParams={searchParams}
        isPublic={false}
      />
    </Container>
  );
}