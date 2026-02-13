import { useState, useEffect } from "react";
import { Row, Col, Badge, Button, Card, Table, Form, Alert, Modal } from "react-bootstrap";
import { useGetTenantProfileQuery } from "../../store/api/tenantApi";
import { useCreateMaintenanceRequestMutation } from '../../store/api/maintenanceApi';

const API_BASE_URL = 'http://localhost:5000/api';

const categoryIcons = {
  plumbing: "bi-droplet-fill",
  electrical: "bi-lightning-fill",
  heating: "bi-thermometer-half",
  security: "bi-shield-fill",
  appliances: "bi-pc-display",
  other: "bi-tools"
};

export default function Maintenance() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useState([
    { id: 1, issue: "Leaky kitchen sink", status: "Pending", date: "2025-07-10", category: "plumbing", priority: "high" },
    { id: 2, issue: "Bedroom lights flickering", status: "Resolved", date: "2025-06-28", category: "electrical", priority: "medium" }
  ]);
  const tenantId = localStorage.getItem("tenantId");
  const token = localStorage.getItem("token");
  const { data: tenantProfile } = useGetTenantProfileQuery(tenantId, { skip: !tenantId });
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'medium',
    description: '',
    location: '',
    contactPreference: 'phone',
    urgentReason: ''
  });
  const [editFormData, setEditFormData] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!tenantId) return;
      setLoading(true);
      setLoadError(false);
      try {
        const response = await fetch(`${API_BASE_URL}/maintenance/tenant/${tenantId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!response.ok) throw new Error('Failed to fetch maintenance requests');
        const list = await response.json();
        const normalized = (list || []).map((req) => {
          const status = req.status ? req.status.replace(/_/g, ' ') : 'pending';
          const title = req.title || req.description || 'Maintenance Request';
          return {
            id: req.id,
            issue: title,
            status: status.charAt(0).toUpperCase() + status.slice(1),
            date: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—',
            category: req.category || 'other',
            priority: req.priority || 'medium',
            description: req.description || ''
          };
        });
        setMaintenanceRequests(normalized);
      } catch (err) {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [tenantId, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.category || !formData.description.trim()) {
      setAlertMessage('Please fill in all required fields');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    const propertyId = tenantProfile?.currentPropertyId || tenantProfile?.leases?.[0]?.property?.id;

    if (!tenantId || !propertyId) {
      setAlertMessage('Unable to determine property for this request.');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          tenantId,
          propertyId,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          category: formData.category
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit maintenance request');
      }

      const created = await response.json();
      const status = created.status ? created.status.replace(/_/g, ' ') : 'open';
      const normalized = {
        id: created.id,
        issue: created.title || created.description || 'Maintenance Request',
        status: status.charAt(0).toUpperCase() + status.slice(1),
        date: created.createdAt ? new Date(created.createdAt).toLocaleDateString() : '—',
        category: created.category || 'other',
        priority: created.priority || 'medium',
        description: created.description || ''
      };

      setMaintenanceRequests(prev => [normalized, ...prev]);
      setAlertMessage('Maintenance request submitted successfully!');
      setShowAlert(true);

      setFormData({
        title: '',
        category: '',
        priority: 'medium',
        description: '',
        location: '',
        contactPreference: 'phone',
        urgentReason: ''
      });
      setShowModal(false);
    } catch (error) {
      setAlertMessage('Failed to submit maintenance request');
      setShowAlert(true);
    } finally {
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'completed': return 'success';
      case 'in-progress':
      case 'in progress': return 'primary';
      case 'pending':
      case 'open': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const handleEdit = (request) => {
    const status = request.status?.toLowerCase();
    if (status === 'resolved' || status === 'completed' || status === 'cancelled') {
      setAlertMessage('Cannot edit resolved or cancelled requests');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    setEditingRequest(request);
    setEditFormData({
      title: request.issue,
      category: request.category,
      priority: request.priority,
      description: request.description || '',
      location: request.location || '',
      contactPreference: request.contactPreference || 'phone',
      urgentReason: request.urgentReason || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.title?.trim() || !editFormData.category || !editFormData.description?.trim()) {
      setAlertMessage('Please fill in all required fields');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    try {
      // API call to update maintenance request
      const response = await fetch(`${API_BASE_URL}/maintenance/${editingRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: editFormData.title,
          category: editFormData.category,
          priority: editFormData.priority,
          description: editFormData.description
        }),
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        setMaintenanceRequests(prev => 
          prev.map(req => req.id === editingRequest.id ? {
            ...req,
            issue: editFormData.title,
            category: editFormData.category,
            priority: editFormData.priority,
            description: editFormData.description
          } : req)
        );
        setAlertMessage('Maintenance request updated successfully!');
      } else {
        setAlertMessage('Failed to update maintenance request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      setAlertMessage('Error updating maintenance request');
    }

    setShowAlert(true);
    setShowEditModal(false);
    setEditingRequest(null);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const handleDelete = async (requestId) => {
    const request = maintenanceRequests.find(r => r.id === requestId);

    if (request?.status?.toLowerCase() === 'in-progress' || request?.status?.toLowerCase() === 'in progress') {
      setAlertMessage('Cannot delete requests that are currently in progress');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    if (!window.confirm('Are you sure you want to delete this maintenance request? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/${requestId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });

      if (response.ok) {
        setMaintenanceRequests(prev => prev.filter(req => req.id !== requestId));
        setAlertMessage('Maintenance request deleted successfully');
      } else {
        setAlertMessage('Failed to delete maintenance request');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      setAlertMessage('Error deleting maintenance request');
    }

    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleView = (request) => {
    // Show detailed view modal
    alert(`Viewing details for: ${request.issue}\nCategory: ${request.category}\nPriority: ${request.priority}\nStatus: ${request.status}\nDate: ${request.date}`);
  };

  const canEdit = (request) => {
    const status = request.status?.toLowerCase();
    return status === 'pending' || status === 'open' || status === 'in-progress' || status === 'in progress';
  };

  const canDelete = (request) => {
    const status = request.status?.toLowerCase();
    return status === 'pending' || status === 'open';
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      {showAlert && (
        <Alert variant={alertMessage.includes('successfully') ? 'success' : 'danger'} className="mb-4">
          {alertMessage}
        </Alert>
      )}

      {loading && (
        <Alert variant="info" className="mb-4">
          Loading maintenance requests...
        </Alert>
      )}

      {loadError && (
        <Alert variant="danger" className="mb-4">
          Failed to load maintenance requests.
        </Alert>
      )}

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">
              <i className="bi bi-tools me-2 text-primary"></i>
              Maintenance Requests
            </h4>
            <Button 
              variant="primary" 
              onClick={() => setShowModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <i className="bi bi-plus-circle"></i>
              New Request
            </Button>
          </div>

          {/* Quick Stats */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="border-0 bg-light">
                <Card.Body className="text-center">
                  <h5 className="text-primary mb-1">{maintenanceRequests.length}</h5>
                  <small className="text-muted">Total Requests</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 bg-light">
                <Card.Body className="text-center">
                  <h5 className="text-warning mb-1">{maintenanceRequests.filter(r => ['pending', 'open'].includes(r.status?.toLowerCase())).length}</h5>
                  <small className="text-muted">Pending</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 bg-light">
                <Card.Body className="text-center">
                  <h5 className="text-success mb-1">{maintenanceRequests.filter(r => ['resolved', 'completed'].includes(r.status?.toLowerCase())).length}</h5>
                  <small className="text-muted">Resolved</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 bg-light">
                <Card.Body className="text-center">
                  <h5 className="text-danger mb-1">{maintenanceRequests.filter(r => r.priority === 'urgent' || r.priority === 'high').length}</h5>
                  <small className="text-muted">High Priority</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Requests Table */}
          <Table hover responsive>
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Issue</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRequests.map(request => (
                <tr key={request.id}>
                  <td className="fw-medium">#{request.id}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <i className={`bi ${categoryIcons[request.category] || 'bi-tools'} me-2 text-primary`}></i>
                      {request.issue}
                    </div>
                  </td>
                  <td>
                    <Badge bg="light" text="dark" className="text-capitalize">
                      {request.category}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getPriorityColor(request.priority)} className="text-capitalize">
                      {request.priority}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </td>
                  <td>{request.date}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        onClick={() => handleView(request)}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                      
                      {canEdit(request) && (
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={() => handleEdit(request)}
                          title="Edit Request"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                      )}
                      
                      {canDelete(request) && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(request.id)}
                          title="Delete Request"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      )}
                      
                      {!canEdit(request) && !canDelete(request) && request.status !== 'Pending' && (
                        <span className="text-muted small">
                          {request.status === 'Resolved' ? 'Completed' : 'Read-only'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modern Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <i className="bi bi-plus-circle-fill text-primary"></i>
            Submit Maintenance Request
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="pt-2">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="bi bi-pencil me-1"></i>
                    Issue Title *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Brief description of the issue"
                    className="border-2"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="bi bi-flag me-1"></i>
                    Priority
                  </Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="border-2"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="bi bi-grid me-1"></i>
                    Category *
                  </Form.Label>
                  <div className="row g-2">
                    {Object.entries(categoryIcons).map(([category, icon]) => (
                      <div key={category} className="col-6">
                        <Form.Check
                          type="radio"
                          name="category"
                          value={category}
                          id={category}
                          checked={formData.category === category}
                          onChange={handleInputChange}
                          label={
                            <div className="d-flex align-items-center gap-2">
                              <i className={`bi ${icon}`}></i>
                              <span className="text-capitalize">{category}</span>
                            </div>
                          }
                          className="border rounded p-2 m-0"
                        />
                      </div>
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="bi bi-geo-alt me-1"></i>
                    Location in Property
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Kitchen, Bedroom 1, Bathroom"
                    className="border-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="bi bi-telephone me-1"></i>
                    Preferred Contact Method
                  </Form.Label>
                  <Form.Select
                    name="contactPreference"
                    value={formData.contactPreference}
                    onChange={handleInputChange}
                    className="border-2"
                  >
                    <option value="phone">📞 Phone Call</option>
                    <option value="sms">💬 SMS</option>
                    <option value="email">📧 Email</option>
                    <option value="app">📱 App Notification</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">
                <i className="bi bi-chat-text me-1"></i>
                Detailed Description *
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Please provide a detailed description of the issue, including when it started, what you've noticed, and any other relevant information..."
                className="border-2"
              />
            </Form.Group>

            {formData.priority === 'urgent' && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium text-danger">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Urgent Request Justification
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="urgentReason"
                  value={formData.urgentReason}
                  onChange={handleInputChange}
                  placeholder="Please explain why this issue requires urgent attention..."
                  className="border-2 border-warning"
                />
              </Form.Group>
            )}

            <div className="bg-light rounded p-3 mb-3">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                <strong>Note:</strong> Emergency issues (gas leaks, electrical hazards, flooding) should be reported immediately by calling the emergency hotline: <strong className="text-danger">+254 700 000 000</strong>
              </small>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} className="px-4">
            <i className="bi bi-send me-1"></i>
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <i className="bi bi-pencil-fill text-warning"></i>
            Edit Maintenance Request
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="pt-2">
          <Form onSubmit={handleEditSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="bi bi-pencil me-1"></i>
                    Issue Title *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={editFormData.title || ''}
                    onChange={handleEditInputChange}
                    placeholder="Brief description of the issue"
                    className="border-2"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="bi bi-flag me-1"></i>
                    Priority
                  </Form.Label>
                  <Form.Select
                    name="priority"
                    value={editFormData.priority || 'medium'}
                    onChange={handleEditInputChange}
                    className="border-2"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="bi bi-grid me-1"></i>
                    Category *
                  </Form.Label>
                  <div className="row g-2">
                    {Object.entries(categoryIcons).map(([category, icon]) => (
                      <div key={category} className="col-6">
                        <Form.Check
                          type="radio"
                          name="category"
                          value={category}
                          id={`edit-${category}`}
                          checked={editFormData.category === category}
                          onChange={handleEditInputChange}
                          label={
                            <div className="d-flex align-items-center gap-2">
                              <i className={`bi ${icon}`}></i>
                              <span className="text-capitalize">{category}</span>
                            </div>
                          }
                          className="border rounded p-2 m-0"
                        />
                      </div>
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="bi bi-geo-alt me-1"></i>
                    Location in Property
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={editFormData.location || ''}
                    onChange={handleEditInputChange}
                    placeholder="e.g., Kitchen, Bedroom 1, Bathroom"
                    className="border-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">
                    <i className="bi bi-telephone me-1"></i>
                    Preferred Contact Method
                  </Form.Label>
                  <Form.Select
                    name="contactPreference"
                    value={editFormData.contactPreference || 'phone'}
                    onChange={handleEditInputChange}
                    className="border-2"
                  >
                    <option value="phone">📞 Phone Call</option>
                    <option value="sms">💬 SMS</option>
                    <option value="email">📧 Email</option>
                    <option value="app">📱 App Notification</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">
                <i className="bi bi-chat-text me-1"></i>
                Detailed Description *
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={editFormData.description || ''}
                onChange={handleEditInputChange}
                placeholder="Please provide a detailed description of the issue..."
                className="border-2"
              />
            </Form.Group>

            {editFormData.priority === 'urgent' && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium text-danger">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Urgent Request Justification
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="urgentReason"
                  value={editFormData.urgentReason || ''}
                  onChange={handleEditInputChange}
                  placeholder="Please explain why this issue requires urgent attention..."
                  className="border-2 border-warning"
                />
              </Form.Group>
            )}

            <div className="bg-info bg-opacity-10 rounded p-3 mb-3">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                <strong>Note:</strong> Status changes are handled by maintenance staff and cannot be modified directly by tenants.
              </small>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleEditSubmit} className="px-4">
            <i className="bi bi-check me-1"></i>
            Update Request
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
