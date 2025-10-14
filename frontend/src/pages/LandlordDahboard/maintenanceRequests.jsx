import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  Settings, 
  DollarSign,
  Filter,
  Search,
  Plus,
  Edit,
  Eye
} from 'lucide-react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Spinner, Alert } from 'react-bootstrap';

const MaintenanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    priority: 'all',
    dateRange: 'all',
    property: 'all',
    contractor: 'all'
  });
  const [expenses, setExpenses] = useState([]);

  // Fetch maintenance requests
  useEffect(() => {
    fetchMaintenanceRequests();
    fetchContractors();
    
    // Set up real-time updates (WebSocket or polling)
    const interval = setInterval(fetchMaintenanceRequests, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/maintenance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContractors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/contractors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContractors(data.contractors || []);
      }
    } catch (error) {
      console.error('Error fetching contractors:', error);
    }
  };

  const updateRequestStatus = async (requestId, status, contractorId = null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/maintenance/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status, 
          contractorId,
          updatedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        await fetchMaintenanceRequests(); // Refresh data
        // This will also trigger real-time update for tenant
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const assignContractor = async (requestId, contractorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/maintenance/${requestId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contractorId })
      });

      if (response.ok) {
        await fetchMaintenanceRequests();
        await updateRequestStatus(requestId, 'in_progress', contractorId);
      }
    } catch (error) {
      console.error('Error assigning contractor:', error);
    }
  };

  const addExpense = async (requestId, expenseData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/maintenance/${requestId}/expenses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      if (response.ok) {
        await fetchMaintenanceRequests();
        setShowExpenseModal(false);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const updateRequest = async (requestId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/maintenance/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        await fetchMaintenanceRequests();
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.property?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Advanced filter logic
    const matchesPriority = advancedFilters.priority === 'all' || request.priority === advancedFilters.priority;
    const matchesProperty = advancedFilters.property === 'all' || request.property?._id === advancedFilters.property;
    const matchesContractor = advancedFilters.contractor === 'all' || request.contractor?._id === advancedFilters.contractor;
    
    let matchesDateRange = true;
    if (advancedFilters.dateRange !== 'all') {
      const requestDate = new Date(request.createdAt);
      const today = new Date();
      
      switch (advancedFilters.dateRange) {
        case 'today':
          matchesDateRange = requestDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDateRange = requestDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDateRange = requestDate >= monthAgo;
          break;
      }
    }
    
    return matchesFilter && matchesSearch && matchesPriority && matchesProperty && matchesContractor && matchesDateRange;
  });

  const getRequestStats = () => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      inProgress: requests.filter(r => r.status === 'in_progress').length,
      completed: requests.filter(r => r.status === 'completed').length
    };
  };

  const stats = getRequestStats();

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{height: '300px'}}>
        <Spinner animation="border" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="fw-bold mb-0">Maintenance Requests</h2>
            <Button variant="primary">
              <Plus size={16} className="me-2" />
              Add Request
            </Button>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary text-white rounded p-3 me-3">
                  <Settings size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Total Requests</p>
                  <h3 className="mb-0 fw-bold">{stats.total}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-warning text-white rounded p-3 me-3">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Pending</p>
                  <h3 className="mb-0 fw-bold">{stats.pending}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-info text-white rounded p-3 me-3">
                  <Settings size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">In Progress</p>
                  <h3 className="mb-0 fw-bold">{stats.inProgress}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success text-white rounded p-3 me-3">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Completed</p>
                  <h3 className="mb-0 fw-bold">{stats.completed}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col lg={6}>
              <div className="position-relative">
                <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <Form.Control
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{paddingLeft: '2.5rem'}}
                />
              </div>
            </Col>
            
            <Col lg={3}>
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>

            <Col lg={3}>
              <Button
                variant={showAdvancedFilter ? "primary" : "outline-secondary"}
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                className="w-100"
              >
                <Filter size={16} className="me-2" />
                Filters
              </Button>
            </Col>
          </Row>

          {/* Advanced Filters */}
          {showAdvancedFilter && (
            <>
              <hr />
              <Row className="g-3">
                <Col md={3}>
                  <Form.Label className="small fw-medium text-muted">Priority</Form.Label>
                  <Form.Select
                    value={advancedFilters.priority}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, priority: e.target.value})}
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Label className="small fw-medium text-muted">Date Range</Form.Label>
                  <Form.Select
                    value={advancedFilters.dateRange}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, dateRange: e.target.value})}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Label className="small fw-medium text-muted">Property</Form.Label>
                  <Form.Select
                    value={advancedFilters.property}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, property: e.target.value})}
                  >
                    <option value="all">All Properties</option>
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Label className="small fw-medium text-muted">Contractor</Form.Label>
                  <Form.Select
                    value={advancedFilters.contractor}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, contractor: e.target.value})}
                  >
                    <option value="all">All Contractors</option>
                    {contractors.map(contractor => (
                      <option key={contractor._id} value={contractor._id}>
                        {contractor.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
              
              <div className="mt-3 text-end">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setAdvancedFilters({
                    priority: 'all',
                    dateRange: 'all',
                    property: 'all',
                    contractor: 'all'
                  })}
                >
                  Clear Filters
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Requests List */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request, index) => (
              <div key={request._id} className={`p-4 ${index !== filteredRequests.length - 1 ? 'border-bottom' : ''}`}>
                <Row>
                  <Col lg={8}>
                    <div className="mb-2">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h5 className="mb-0 fw-semibold">{request.title}</h5>
                        <Badge 
                          bg={getStatusVariant(request.status)}
                          className="text-uppercase"
                        >
                          {request.status.replace('_', ' ')}
                        </Badge>
                        <span className={`small fw-medium ${getPriorityTextColor(request.priority)}`}>
                          <AlertCircle size={14} className="me-1" />
                          {request.priority} priority
                        </span>
                      </div>
                      
                      <p className="text-muted mb-3">{request.description}</p>
                      
                      <Row className="g-2 text-muted small">
                        <Col auto>
                          <User size={14} className="me-1" />
                          {request.tenant?.name || 'Unknown Tenant'}
                        </Col>
                        <Col auto>
                          <MapPin size={14} className="me-1" />
                          {request.property?.address || 'Address not available'}
                        </Col>
                        <Col auto>
                          <Calendar size={14} className="me-1" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </Col>
                        {request.contractor && (
                          <Col auto>
                            <Settings size={14} className="me-1" />
                            Assigned to: {request.contractor.name}
                          </Col>
                        )}
                        {request.totalExpenses > 0 && (
                          <Col auto>
                            <DollarSign size={14} className="me-1" />
                            Expenses: ${request.totalExpenses}
                          </Col>
                        )}
                      </Row>
                    </div>
                  </Col>

                  <Col lg={4} className="text-end">
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex gap-2 justify-content-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye size={14} className="me-1" />
                          View
                        </Button>

                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit size={14} className="me-1" />
                          Edit
                        </Button>
                      </div>

                      {request.status === 'pending' && (
                        <div className="d-flex flex-column gap-2">
                          <Form.Select
                            size="sm"
                            onChange={(e) => e.target.value && assignContractor(request._id, e.target.value)}
                            defaultValue=""
                          >
                            <option value="">Assign Contractor</option>
                            {contractors.map(contractor => (
                              <option key={contractor._id} value={contractor._id}>
                                {contractor.name}
                              </option>
                            ))}
                          </Form.Select>
                          
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => updateRequestStatus(request._id, 'in_progress')}
                          >
                            Start Work
                          </Button>
                        </div>
                      )}

                      {request.status === 'in_progress' && (
                        <div className="d-flex flex-column gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowExpenseModal(true);
                            }}
                          >
                            <DollarSign size={14} className="me-1" />
                            Add Expense
                          </Button>
                          
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => updateRequestStatus(request._id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            ))
          ) : (
            <div className="text-center py-5">
              <Settings size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No maintenance requests</h5>
              <p className="text-muted">No requests match your current filters.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modals */}
      {showExpenseModal && selectedRequest && (
        <ExpenseModal
          show={showExpenseModal}
          request={selectedRequest}
          onHide={() => setShowExpenseModal(false)}
          onSubmit={(expenseData) => addExpense(selectedRequest._id, expenseData)}
        />
      )}

      {showEditModal && selectedRequest && (
        <EditRequestModal
          show={showEditModal}
          request={selectedRequest}
          onHide={() => setShowEditModal(false)}
          onSubmit={(updateData) => updateRequest(selectedRequest._id, updateData)}
        />
      )}

      {selectedRequest && !showExpenseModal && !showEditModal && (
        <RequestDetailsModal
          show={!!selectedRequest}
          request={selectedRequest}
          onHide={() => setSelectedRequest(null)}
          onStatusUpdate={updateRequestStatus}
          contractors={contractors}
        />
      )}
    </Container>
  );
};

// Helper functions for Bootstrap variants
const getStatusVariant = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'in_progress': return 'info';
    case 'completed': return 'success';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
};

const getPriorityTextColor = (priority) => {
  switch (priority) {
    case 'high': return 'text-danger';
    case 'medium': return 'text-warning';
    case 'low': return 'text-success';
    default: return 'text-muted';
  }
};

// Bootstrap Modal Components
const ExpenseModal = ({ show, request, onHide, onSubmit }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'materials',
    receipt: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Expense</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="materials">Materials</option>
              <option value="labor">Labor</option>
              <option value="contractor">Contractor Fee</option>
              <option value="other">Other</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Expense
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// Edit Request Modal Component
const EditRequestModal = ({ show, request, onHide, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: request.title || '',
    description: request.description || '',
    priority: request.priority || 'medium',
    category: request.category || 'general'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Priority</Form.Label>
            <Form.Select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="general">General</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC</option>
              <option value="appliance">Appliance</option>
              <option value="structural">Structural</option>
              <option value="other">Other</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Request
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// Request Details Modal Component
const RequestDetailsModal = ({ show, request, onHide, onStatusUpdate, contractors }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{request.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <h5 className="fw-medium">Request Details</h5>
          <p className="text-muted">{request.description}</p>
          
          <div className="row g-2 text-muted small">
            <div className="col-auto">
              <span className="fw-medium">Status: </span>
              <Badge bg={getStatusVariant(request.status)} className="text-uppercase">
                {request.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="col-auto">
              <span className="fw-medium">Priority: </span>
              <span className={getPriorityTextColor(request.priority)}>
                {request.priority}
              </span>
            </div>
            <div className="col-auto">
              <span className="fw-medium">Created: </span>
              {new Date(request.createdAt).toLocaleDateString()}
            </div>
            <div className="col-auto">
              <span className="fw-medium">Tenant: </span>
              {request.tenant?.name}
            </div>
          </div>
        </div>

        {/* Images */}
        {request.images && request.images.length > 0 && (
          <div className="mb-4">
            <h5 className="fw-medium mb-3">Images</h5>
            <div className="row row-cols-1 row-cols-md-3 g-2">
              {request.images.map((image, index) => (
                <div key={index} className="col">
                  <img
                    src={image}
                    alt={`Maintenance ${index + 1}`}
                    className="w-100 h-auto rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expenses */}
        {request.expenses && request.expenses.length > 0 && (
          <div>
            <h5 className="fw-medium mb-3">Expenses</h5>
            <div className="list-group list-group-flush">
              {request.expenses.map((expense, index) => (
                <div key={index} className="list-group-item d-flex justify-content-between align-items-center py-3">
                  <div>
                    <span className="fw-medium">{expense.description}</span>
                    <span className="text-muted small ms-2">({expense.category})</span>
                  </div>
                  <span className="fw-medium">${expense.amount}</span>
                </div>
              ))}
              <div className="list-group-item d-flex justify-content-between align-items-center py-3 fw-medium">
                <span>Total Expenses:</span>
                <span>${request.totalExpenses || 0}</span>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default MaintenanceRequests;
