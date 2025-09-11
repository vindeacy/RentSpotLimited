import { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";

/**
 * PropertySearch component
 * Props:
 *   onSearch: function to call with search/filter query object
 */
export default function PropertySearch({ onSearch }) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // Build a filter object
    onSearch({
      query,
      city,
      country,
      type,
      minPrice,
      maxPrice,
    });
  }

  return (
    <Form className="mb-4" onSubmit={handleSubmit}>
      <Row className="g-2">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Search by title or description"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Control
            type="text"
            placeholder="City"
            value={city}
            onChange={e => setCity(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Control
            type="text"
            placeholder="Country"
            value={country}
            onChange={e => setCountry(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Select value={type} onChange={e => setType(e.target.value)}>
            <option value="">Type</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="studio">Studio</option>
            <option value="room">Room</option>
          </Form.Select>
        </Col>
        <Col md={1}>
          <Form.Control
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            min={0}
          />
        </Col>
        <Col md={1}>
          <Form.Control
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            min={0}
          />
        </Col>
        <Col md={1}>
          <Button type="submit" variant="primary" className="w-100">
            Search
          </Button>
        </Col>
      </Row>
    </Form>
  );
}