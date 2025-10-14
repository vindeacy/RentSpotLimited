import { useState, useEffect } from "react";
import { Row, Col, Badge, Button, Card, Form, Modal, Alert, ProgressBar } from "react-bootstrap";

const API_BASE_URL = 'http://localhost:5000/api';

const landlordCategories = [
  { key: 'communication', label: 'Communication', icon: 'bi-chat-dots' },
  { key: 'responsiveness', label: 'Responsiveness', icon: 'bi-clock' },
  { key: 'maintenance', label: 'Maintenance', icon: 'bi-tools' },
  { key: 'fairness', label: 'Fairness', icon: 'bi-balance-scale' }
];

const propertyCategories = [
  { key: 'location', label: 'Location', icon: 'bi-geo-alt' },
  { key: 'cleanliness', label: 'Cleanliness', icon: 'bi-house-check' },
  { key: 'security', label: 'Security', icon: 'bi-shield-check' },
  { key: 'amenities', label: 'Amenities', icon: 'bi-list-stars' },
  { key: 'value', label: 'Value for Money', icon: 'bi-currency-dollar' }
];

export default function Reviews() {
  const [showModal, setShowModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    target: '',
    type: 'property',
    rating: 5,
    comment: '',
    categories: {}
  });

  // Get tenant ID from localStorage or context (adjust as needed)
  const tenantId = localStorage.getItem('tenantId') || 'temp-tenant-id';

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tenant-profile/${tenantId}`);
      if (response.ok) {
        const tenantData = await response.json();
        // Assuming reviews are part of tenant data or we need a separate endpoint
        // For now, let's use a placeholder until we have the exact API structure
        setReviews(tenantData.reviews || []);
      } else {
        console.error('Failed to fetch reviews');
        setAlertMessage('Failed to load reviews');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setAlertMessage('Error loading reviews');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryRating = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      categories: { ...prev.categories, [category]: rating }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.target || !formData.comment.trim()) {
      setAlertMessage('Please fill in all required fields');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    setSubmitting(true);
    
    try {
      const reviewData = {
        tenantId,
        target: formData.target,
        type: formData.type,
        rating: formData.rating,
        comment: formData.comment,
        categories: formData.categories
      };

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews(prev => [newReview, ...prev]);
        setAlertMessage('Review submitted successfully!');
        setShowAlert(true);
        setShowModal(false);
        
        // Reset form
        setFormData({
          target: '',
          type: 'property',
          rating: 5,
          comment: '',
          categories: {}
        });
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.error || 'Failed to submit review');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setAlertMessage('Error submitting review');
      setShowAlert(true);
    } finally {
      setSubmitting(false);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReviews(prev => prev.filter(review => review.id !== reviewId));
        setAlertMessage('Review deleted successfully');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        setAlertMessage('Failed to delete review');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      setAlertMessage('Error deleting review');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });

      if (response.ok) {
        setReviews(prev => prev.map(review => 
          review.id === reviewId 
            ? { ...review, helpful: (review.helpful || 0) + 1 }
            : review
        ));
      }
    } catch (error) {
      console.error('Error voting helpful:', error);
    }
  };

  const renderStars = (rating, interactive = false, onRate = null, category = null) => {
    return (
      <div className="d-flex">
        {[1, 2, 3, 4, 5].map(star => (
          <i
            key={star}
            className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'} ${interactive ? 'text-warning' : 'text-warning'}`}
            style={{ 
              cursor: interactive ? 'pointer' : 'default',
              fontSize: interactive ? '1.2rem' : '1rem',
              marginRight: '2px'
            }}
            onClick={() => interactive && onRate && onRate(category, star)}
          />
        ))}
      </div>
    );
  };

  const getOverallRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const currentCategories = formData.type === 'landlord' ? landlordCategories : propertyCategories;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showAlert && (
        <Alert variant={alertMessage.includes('successfully') ? 'success' : 'danger'} className="mb-4">
          {alertMessage}
        </Alert>
      )}

      {/* Reviews Overview */}
      <Row className="mb-4">
        <Col lg={4}>
          <Card className="border-0 shadow-lg h-100">
            <Card.Body className="p-4 text-center">
              <div className="mb-3">
                <h1 className="display-4 fw-bold text-primary mb-0">{getOverallRating()}</h1>
                <div className="mb-2">{renderStars(Math.round(getOverallRating()))}</div>
                <p className="text-muted mb-0">Based on {reviews.length} reviews</p>
              </div>
              
              <div className="text-start">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = getRatingDistribution()[rating];
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={rating} className="d-flex align-items-center mb-2">
                      <span className="me-2">{rating}</span>
                      <i className="bi bi-star-fill text-warning me-2"></i>
                      <ProgressBar 
                        now={percentage} 
                        className="flex-grow-1 me-2" 
                        style={{ height: '6px' }}
                        variant="warning"
                      />
                      <span className="text-muted small">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-lg h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 className="mb-1">Your Reviews</h5>
                  <p className="text-muted mb-0 small">Share your rental experience</p>
                </div>
                <Button 
                  variant="primary" 
                  onClick={() => setShowModal(true)}
                  className="d-flex align-items-center gap-2"
                  disabled={submitting}
                >
                  <i className="bi bi-plus-circle"></i>
                  Write Review
                </Button>
              </div>

              {/* Quick Stats */}
              <Row className="g-3">
                <Col sm={6}>
                  <div className="bg-light rounded-3 p-3 text-center">
                    <h4 className="text-primary mb-1">{reviews.filter(r => r.type === 'property').length}</h4>
                    <small className="text-muted">Property Reviews</small>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="bg-light rounded-3 p-3 text-center">
                    <h4 className="text-success mb-1">{reviews.filter(r => r.type === 'landlord').length}</h4>
                    <small className="text-muted">Landlord Reviews</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Reviews List */}
      <Card className="border-0 shadow-lg">
        <Card.Body className="p-4">
          <h5 className="mb-4">All Reviews</h5>
          
          {reviews.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-star fs-1 text-muted mb-3 d-block"></i>
              <h6 className="text-muted">No reviews yet</h6>
              <p className="text-muted small">Be the first to share your experience</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <Card key={review.id} className="border border-light">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <div className="d-flex align-items-center mb-2">
                          <h6 className="mb-0 me-3">{review.target}</h6>
                          <Badge 
                            bg={review.type === 'landlord' ? 'primary' : 'success'} 
                            className="text-capitalize"
                          >
                            {review.type}
                          </Badge>
                        </div>
                        <div className="d-flex align-items-center">
                          {renderStars(review.rating)}
                          <span className="ms-2 text-muted small">
                            {new Date(review.createdAt || review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-end">
                        <Button variant="outline-secondary" size="sm" className="me-1">
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </div>

                    <p className="mb-3">{review.comment}</p>

                    {/* Category Ratings */}
                    {review.categories && Object.keys(review.categories).length > 0 && (
                      <div className="mb-3">
                        <h6 className="small text-muted mb-2">DETAILED RATINGS</h6>
                        <Row className="g-2">
                          {Object.entries(review.categories).map(([category, rating]) => {
                            const categoryInfo = [...landlordCategories, ...propertyCategories]
                              .find(cat => cat.key === category);
                            return (
                              <Col key={category} sm={6} md={4}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center">
                                    {categoryInfo && <i className={`bi ${categoryInfo.icon} me-1 text-muted`}></i>}
                                    <span className="small">{categoryInfo?.label || category}</span>
                                  </div>
                                  {renderStars(rating)}
                                </div>
                              </Col>
                            );
                          })}
                        </Row>
                      </div>
                    )}

                    {/* Review Actions */}
                    <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                      <div className="d-flex align-items-center gap-3">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleHelpfulVote(review.id)}
                        >
                          <i className="bi bi-hand-thumbs-up me-1"></i>
                          Helpful ({review.helpful || 0})
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          <i className="bi bi-share me-1"></i>
                          Share
                        </Button>
                      </div>
                      <small className="text-muted">
                        {review.helpful || 0} found this helpful
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Review Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <i className="bi bi-star-fill text-warning"></i>
            Write a Review
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="pt-2">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Review Type *</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="border-2"
                  >
                    <option value="property">Property Review</option>
                    <option value="landlord">Landlord Review</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Target *</Form.Label>
                  <Form.Control
                    type="text"
                    name="target"
                    value={formData.target}
                    onChange={handleInputChange}
                    placeholder={formData.type === 'landlord' ? 'Landlord name' : 'Property name/address'}
                    className="border-2"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">Overall Rating *</Form.Label>
              <div className="d-flex align-items-center gap-3">
                {renderStars(formData.rating, true, (_, rating) => setFormData(prev => ({ ...prev, rating })))}
                <span className="text-muted">({formData.rating} stars)</span>
              </div>
            </Form.Group>

            {/* Category Ratings */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-medium">
                Detailed Ratings ({formData.type === 'landlord' ? 'Landlord' : 'Property'})
              </Form.Label>
              <Row className="g-3">
                {currentCategories.map(category => (
                  <Col key={category.key} sm={6}>
                    <div className="bg-light rounded-3 p-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center">
                          <i className={`bi ${category.icon} me-2 text-primary`}></i>
                          <span className="small fw-medium">{category.label}</span>
                        </div>
                      </div>
                      {renderStars(
                        formData.categories[category.key] || 0, 
                        true, 
                        handleCategoryRating, 
                        category.key
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">Review Comment *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="Share your detailed experience... What did you like? What could be improved?"
                className="border-2"
              />
              <Form.Text className="text-muted">
                Be specific and helpful. Your review helps other tenants make informed decisions.
              </Form.Text>
            </Form.Group>

            <div className="bg-light rounded-3 p-3 mb-3">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                <strong>Review Guidelines:</strong> Please be honest, specific, and constructive. 
                Avoid personal attacks and focus on your rental experience.
              </small>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            className="px-4"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Submitting...
              </>
            ) : (
              <>
                <i className="bi bi-send me-1"></i>
                Submit Review
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
