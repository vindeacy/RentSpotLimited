import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Table } from 'react-bootstrap';
import { 
  UserCheck, 
  Users, 
  FileText, 
  MessageSquare, 
  Search, 
  Filter,  
  Eye, 
  Edit, 
  Calendar, 
  Home, 
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

// Unified API Imports
import { 
  useGetTenantsQuery, 
  useGetApplicationsQuery, 
  useGetLeasesQuery 
} from '../../store/api/tenantApi';

// Component Import
import AddTenantModal from './AddTenantModal'; 

/**
 * HELPER: getStatusBadge
 * Moved outside the component so all sub-sections can access it
 */
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
  
  const config = statusConfig[status?.toLowerCase()] || { bg: 'secondary', text: status };
  return <Badge bg={config.bg}>{config.text}</Badge>;
};

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

  const getTenantStats = () => {
    return {
      total: tenants.length,
      active: tenants.filter(t => t.status === 'active').length,
      pending: applications.filter(a => a.status === 'pending').length,
      newApplications: applications.filter(a => {
        const today = new Date();
        const appDate = new Date(a.createdAt);
        return today - appDate < 24 * 60 * 60 * 1000; 
      }).length
    };
  };

  const stats = getTenantStats();

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Tenant Management</h2>
              <p className="text-muted mb-0">Handle applications, leases, and communication.</p>
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
        {[
          { label: 'Total Tenants', val: stats.total, icon: <Users />, bg: 'bg-primary' },
          { label: 'Active Tenants', val: stats.active, icon: <CheckCircle />, bg: 'bg-success' },
          { label: 'Pending Apps', val: stats.pending, icon: <Clock />, bg: 'bg-warning' },
          { label: 'New Apps', val: stats.newApplications, icon: <FileText />, bg: 'bg-info' }
        ].map((s, i) => (
          <Col md={3} key={i}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div className={`${s.bg} text-white rounded p-3 me-3`}>{s.icon}</div>
                <div>
                  <p className="text-muted mb-0 small">{s.label}</p>
                  <h3 className="mb-0 fw-bold">{s.val}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Navigation Tabs */}
      <Row className="g-4 mb-4">
        {[
          { id: 'applications', label: 'Applications', icon: <FileText />, sub: 'Review apps', color: 'primary' },
          { id: 'leases', label: 'Lease Management', icon: <FileText />, sub: 'Manage contracts', color: 'success' },
          { id: 'communication', label: 'Communication', icon: <MessageSquare />, sub: 'Message tenants', color: 'warning' },
          { id: 'background', label: 'Background Checks', icon: <UserCheck />, sub: 'Verify ID', color: 'info' }
        ].map(sect => (
          <Col md={3} key={sect.id}>
            <Card 
              className={`border-${sect.color} h-100 cursor-pointer ${activeSection === sect.id ? `bg-${sect.color}-subtle` : ''}`}
              onClick={() => setActiveSection(sect.id)}
              style={{ cursor: 'pointer' }}
            >
              <Card.Body className="text-center">
                <div className={`text-${sect.color} mb-2`}>{React.cloneElement(sect.icon, { size: 40 })}</div>
                <h6 className={`text-${sect.color} fw-bold`}>{sect.label}</h6>
                <small className="text-muted">{sect.sub}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Search & Filter */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col lg={6}>
              <div className="position-relative">
                <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <Form.Control
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-5"
                />
              </div>
            </Col>
            <Col lg={3}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Col>
            <Col lg={3}>
              <Button variant="outline-primary" className="w-100"><Filter size={16} className="me-2"/>Filters</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Dynamic Content */}
      {activeSection === 'tenants' && (
        <TenantsListSection 
          tenants={tenants} 
          loading={tenantsLoading}
          onViewDetails={(t) => { setSelectedTenant(t); setShowDetailsModal(true); }}
        />
      )}

      {activeSection === 'applications' && <ApplicationsSection applications={applications} loading={applicationsLoading} />}
      {activeSection === 'leases' && <LeasesSection leases={leases} loading={leasesLoading} />}
      {activeSection === 'communication' && <PlaceholderSection title="Communication" icon={<MessageSquare size={48}/>} />}
      {activeSection === 'background' && <PlaceholderSection title="Background Checks" icon={<UserCheck size={48}/>} />}

      {/* Default Fallback */}
      {!['applications', 'leases', 'communication', 'background'].includes(activeSection) && activeSection !== 'tenants' && (
         <TenantsListSection tenants={tenants} loading={tenantsLoading} onViewDetails={(t) => { setSelectedTenant(t); setShowDetailsModal(true); }} />
      )}

      {/* MODALS */}
      <AddTenantModal show={showAddModal} onHide={() => setShowAddModal(false)} />
      
      <TenantDetailsModal 
        show={showDetailsModal} 
        tenant={selectedTenant} 
        onHide={() => { setShowDetailsModal(false); setSelectedTenant(null); }} 
      />
    </Container>
  );
};

/**
 * SUB-COMPONENT: Tenants List
 */
const TenantsListSection = ({ tenants, loading, onViewDetails }) => {
  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-0">
        {tenants.length > 0 ? (
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Tenant</th>
                <th>Property</th>
                <th>Rent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="fw-bold">{t.user?.name || 'Unknown User'}</div>
                    <small className="text-muted">{t.user?.email}</small>
                  </td>
                  <td>{t.currentProperty?.name || 'Unassigned'}</td>
                  <td>${t.rent || 0}</td>
                  <td>{getStatusBadge(t.status || 'active')}</td>
                  <td>
                    <Button variant="link" size="sm" onClick={() => onViewDetails(t)}><Eye size={16}/></Button>
                    <Button variant="link" size="sm" className="text-success"><Edit size={16}/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center py-5">
            <Users size={48} className="text-muted mb-2" />
            <p className="text-muted">No tenants found.</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

/**
 * SUB-COMPONENT: Applications
 */
const ApplicationsSection = ({ applications, loading }) => {
  if (loading) return <div className="text-center py-5"><div className="spinner-border" /></div>;
  return (
    <Row className="g-3">
      {applications.length > 0 ? applications.map(app => (
        <Col md={6} key={app.id}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <h6 className="fw-bold">{app.user?.name}</h6>
                {getStatusBadge(app.status)}
              </div>
              <p className="small text-muted mb-2"><Home size={14}/> {app.property?.name}</p>
              <div className="d-flex gap-2">
                <Button size="sm" variant="success">Approve</Button>
                <Button size="sm" variant="outline-danger">Reject</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      )) : <Col className="text-center py-5"><p>No applications.</p></Col>}
    </Row>
  );
};

const LeasesSection = ({ leases, loading }) => (
  <Card className="border-0 shadow-sm p-4 text-center">
    <FileText size={48} className="text-muted mx-auto mb-2" />
    <p>Lease Management coming soon.</p>
  </Card>
);

const PlaceholderSection = ({ title, icon }) => (
  <Card className="border-0 shadow-sm p-5 text-center">
    <div className="text-muted mb-3">{icon}</div>
    <h5>{title} Module</h5>
    <p className="text-muted">This feature is being implemented.</p>
  </Card>
);

const TenantDetailsModal = ({ show, tenant, onHide }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton><Modal.Title>Tenant Details</Modal.Title></Modal.Header>
    <Modal.Body>
      {tenant ? (
        <>
          <h5 className="fw-bold">{tenant.user?.name}</h5>
          <p className="text-muted">{tenant.user?.email}</p>
          <hr />
          <p><strong>Employment:</strong> {tenant.employmentStatus || 'Not provided'}</p>
          <p><strong>Rating:</strong> {tenant.rating || 0}/5</p>
        </>
      ) : <p>No tenant selected.</p>}
    </Modal.Body>
  </Modal>
);

export default TenantManagement;