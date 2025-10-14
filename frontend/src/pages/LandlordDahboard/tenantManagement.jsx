import React, { useState } from 'react';
import { 
  UserCheck, 
  Users, 
  FileText, 
  MessageSquare, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Mail, 
  Phone, 
  Calendar, 
  Home, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Tabs, Tab, Table } from 'react-bootstrap';
import { useGetTenantsQuery, useGetApplicationsQuery, useGetLeasesQuery } from '../../store/api/tenantApi';

const TenantManagement = () => {
  const [activeSection, setActiveSection] = useState('tenants');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // API calls
  const { data: tenantsData, isLoading: tenantsLoading } = useGetTenantsQuery({ 
    search: searchTerm, 
    status: statusFilter !== 'all' ? statusFilter : undefined 
  });
  const { data: applicationsData, isLoading: applicationsLoading } = useGetApplicationsQuery();
  const { data: leasesData, isLoading: leasesLoading } = useGetLeasesQuery();

  const tenants = tenantsData?.tenants || [];
  const applications = applicationsData?.applications || [];
  const leases = leasesData?.leases || [];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'success', text: 'Active' },
      inactive: { bg: 'secondary', text: 'Inactive' },
      pending: { bg: 'warning', text: 'Pending' },
      suspended: { bg: 'danger', text: 'Suspended' },
      rejected: { bg: 'danger', text: 'Rejected' },
      approved: { bg: 'success', text: 'Approved' },
      reviewing: { bg: 'info', text: 'Under Review' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getTenantStats = () => {
    return {
      total: tenants.length,
      active: tenants.filter(t => t.status === 'active').length,
      pending: applications.filter(a => a.status === 'pending').length,
      newApplications: applications.filter(a => {
        const today = new Date();
        const appDate = new Date(a.createdAt);
        return today - appDate < 24 * 60 * 60 * 1000; // Last 24 hours
      }).length
    };
  };

  const stats = getTenantStats();

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Tenant Management</h2>
              <p className="text-muted mb-0">Handle tenant applications, lease agreements, and communication efficiently.</p>
            </div>
            <Button variant="success" onClick={() => setShowAddModal(true)}>
              <UserCheck size={16} className="me-2" />
              Add Tenant
            </Button>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary text-white rounded p-3 me-3">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Total Tenants</p>
                  <h3 className="mb-0 fw-bold">{stats.total}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success text-white rounded p-3 me-3">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Active Tenants</p>
                  <h3 className="mb-0 fw-bold">{stats.active}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-warning text-white rounded p-3 me-3">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Pending Applications</p>
                  <h3 className="mb-0 fw-bold">{stats.pending}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-info text-white rounded p-3 me-3">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">New Applications</p>
                  <h3 className="mb-0 fw-bold">{stats.newApplications}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Management Sections Cards - Matching your design */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card 
            className={`border-primary h-100 cursor-pointer ${activeSection === 'applications' ? 'bg-primary-subtle' : ''}`}
            onClick={() => setActiveSection('applications')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center">
              <FileText size={48} className="text-primary mb-3" />
              <h6 className="text-primary fw-semibold">Applications</h6>
              <small className="text-muted">Review tenant applications</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card 
            className={`border-success h-100 cursor-pointer ${activeSection === 'leases' ? 'bg-success-subtle' : ''}`}
            onClick={() => setActiveSection('leases')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center">
              <FileText size={48} className="text-success mb-3" />
              <h6 className="text-success fw-semibold">Lease Management</h6>
              <small className="text-muted">Create and manage leases</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card 
            className={`border-warning h-100 cursor-pointer ${activeSection === 'communication' ? 'bg-warning-subtle' : ''}`}
            onClick={() => setActiveSection('communication')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center">
              <MessageSquare size={48} className="text-warning mb-3" />
              <h6 className="text-warning fw-semibold">Communication</h6>
              <small className="text-muted">Message tenants directly</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card 
            className={`border-info h-100 cursor-pointer ${activeSection === 'background' ? 'bg-info-subtle' : ''}`}
            onClick={() => setActiveSection('background')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center">
              <UserCheck size={48} className="text-info mb-3" />
              <h6 className="text-info fw-semibold">Background Checks</h6>
              <small className="text-muted">Verify tenant credentials</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col lg={6}>
              <div className="position-relative">
                <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <Form.Control
                  type="text"
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{paddingLeft: '2.5rem'}}
                />
              </div>
            </Col>
            
            <Col lg={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </Form.Select>
            </Col>

            <Col lg={3}>
              <Button variant="outline-primary" className="w-100">
                <Filter size={16} className="me-2" />
                Advanced Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Content Based on Active Section */}
      {activeSection === 'tenants' && (
        <TenantsListSection 
          tenants={tenants} 
          loading={tenantsLoading}
          onViewDetails={setSelectedTenant}
          onShowDetails={() => setShowDetailsModal(true)}
        />
      )}

      {activeSection === 'applications' && (
        <ApplicationsSection 
          applications={applications} 
          loading={applicationsLoading}
        />
      )}

      {activeSection === 'leases' && (
        <LeasesSection 
          leases={leases} 
          loading={leasesLoading}
        />
      )}

      {activeSection === 'communication' && (
        <CommunicationSection tenants={tenants} />
      )}

      {activeSection === 'background' && (
        <BackgroundChecksSection tenants={tenants} />
      )}

      {/* Default view - Tenants List */}
      {!['applications', 'leases', 'communication', 'background'].includes(activeSection) && (
        <TenantsListSection 
          tenants={tenants} 
          loading={tenantsLoading}
          onViewDetails={setSelectedTenant}
          onShowDetails={() => setShowDetailsModal(true)}
        />
      )}

      {/* Modals */}
      <AddTenantModal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)} 
      />

      <TenantDetailsModal
        show={showDetailsModal}
        tenant={selectedTenant}
        onHide={() => {
          setShowDetailsModal(false);
          setSelectedTenant(null);
        }}
      />
    </Container>
  );
};

// Tenants List Section Component
const TenantsListSection = ({ tenants, loading, onViewDetails, onShowDetails }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-0">
        {tenants.length > 0 ? (
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Tenant</th>
                <th>Property</th>
                <th>Lease Status</th>
                <th>Rent</th>
                <th>Move-in Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                        <span className="fw-bold">{tenant.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="fw-medium">{tenant.name}</div>
                        <small className="text-muted">{tenant.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="fw-medium">{tenant.property?.name}</div>
                      <small className="text-muted">{tenant.property?.address}</small>
                    </div>
                  </td>
                  <td>{getStatusBadge(tenant.leaseStatus || 'active')}</td>
                  <td className="fw-medium">${tenant.rent}/month</td>
                  <td>{tenant.moveInDate ? new Date(tenant.moveInDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{getStatusBadge(tenant.status)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => {
                          onViewDetails(tenant);
                          onShowDetails();
                        }}
                      >
                        <Eye size={14} />
                      </Button>
                      <Button variant="outline-success" size="sm">
                        <Edit size={14} />
                      </Button>
                      <Button variant="outline-info" size="sm">
                        <MessageSquare size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center py-5">
            <Users size={48} className="text-muted mb-3" />
            <h5 className="text-muted">No tenants found</h5>
            <p className="text-muted">Start by adding your first tenant or reviewing applications.</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Applications Section Component
const ApplicationsSection = ({ applications, loading }) => {
  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" /></div>;
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header>
        <h5 className="mb-0">Tenant Applications</h5>
      </Card.Header>
      <Card.Body>
        {applications.length > 0 ? (
          <div className="row g-4">
            {applications.map((app) => (
              <div key={app._id} className="col-md-6">
                <Card className="border">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h6 className="mb-0">{app.applicantName}</h6>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-muted small mb-2">
                      <Home size={14} className="me-1" />
                      {app.property?.name}
                    </p>
                    <p className="text-muted small mb-3">
                      <Calendar size={14} className="me-1" />
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    <div className="d-flex gap-2">
                      <Button variant="outline-primary" size="sm">Review</Button>
                      <Button variant="success" size="sm">Approve</Button>
                      <Button variant="danger" size="sm">Reject</Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <FileText size={48} className="text-muted mb-3" />
            <p className="text-muted">No applications to review</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Other section components (simplified for brevity)
const LeasesSection = ({ leases, loading }) => (
  <Card className="border-0 shadow-sm">
    <Card.Header><h5 className="mb-0">Lease Management</h5></Card.Header>
    <Card.Body>
      <div className="text-center py-4">
        <FileText size={48} className="text-muted mb-3" />
        <p className="text-muted">Lease management interface will be implemented here</p>
      </div>
    </Card.Body>
  </Card>
);

const CommunicationSection = ({ tenants }) => (
  <Card className="border-0 shadow-sm">
    <Card.Header><h5 className="mb-0">Tenant Communication</h5></Card.Header>
    <Card.Body>
      <div className="text-center py-4">
        <MessageSquare size={48} className="text-muted mb-3" />
        <p className="text-muted">Communication interface will be implemented here</p>
      </div>
    </Card.Body>
  </Card>
);

const BackgroundChecksSection = ({ tenants }) => (
  <Card className="border-0 shadow-sm">
    <Card.Header><h5 className="mb-0">Background Checks</h5></Card.Header>
    <Card.Body>
      <div className="text-center py-4">
        <UserCheck size={48} className="text-muted mb-3" />
        <p className="text-muted">Background check interface will be implemented here</p>
      </div>
    </Card.Body>
  </Card>
);

// Add Tenant Modal
const AddTenantModal = ({ show, onHide }) => (
  <Modal show={show} onHide={onHide} size="lg" centered>
    <Modal.Header closeButton>
      <Modal.Title>Add New Tenant</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p className="text-muted">Add tenant form will be implemented here</p>
    </Modal.Body>
  </Modal>
);

// Tenant Details Modal
const TenantDetailsModal = ({ show, tenant, onHide }) => (
  <Modal show={show} onHide={onHide} size="lg" centered>
    <Modal.Header closeButton>
      <Modal.Title>Tenant Details</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {tenant && (
        <div>
          <h6>{tenant.name}</h6>
          <p className="text-muted">{tenant.email}</p>
          <p>Tenant details interface will be implemented here</p>
        </div>
      )}
    </Modal.Body>
  </Modal>
);

// Helper function
const getStatusBadge = (status) => {
  const statusConfig = {
    active: { bg: 'success', text: 'Active' },
    inactive: { bg: 'secondary', text: 'Inactive' },
    pending: { bg: 'warning', text: 'Pending' },
    suspended: { bg: 'danger', text: 'Suspended' },
    rejected: { bg: 'danger', text: 'Rejected' },
    approved: { bg: 'success', text: 'Approved' },
    reviewing: { bg: 'info', text: 'Under Review' }
  };
  
  const config = statusConfig[status] || { bg: 'secondary', text: status };
  return <Badge bg={config.bg}>{config.text}</Badge>;
};

export default TenantManagement;
