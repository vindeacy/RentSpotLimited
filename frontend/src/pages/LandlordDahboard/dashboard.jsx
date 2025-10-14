import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Home, 
  Users, 
  Building, 
  Settings, 
  DollarSign, 
  FileText, 
  BarChart3, 
  Bell, 
  LogOut,
  Menu,
  X,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Plus,
  Eye,
  UserCheck,
  Clock,
  Edit
} from 'lucide-react';
import { Button, Container, Row, Col, Card, Spinner, Badge, Modal, Form, Dropdown, Alert } from 'react-bootstrap';
import { useGetDashboardStatsQuery } from '../../store/api/landlordApi';
import { logout } from '../../store/slices/authSlice';
import MaintenanceRequests from './maintenanceRequests';
import AnalyticReports from './analyticReports';
import Notification from './Notification';
import TenantManagement from './tenantManagement';
import FinancialManagement from './FinancialManagement';

const LandlordDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // New state for modals and actions
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [quickActionType, setQuickActionType] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const { data: dashboardStats, isLoading } = useGetDashboardStatsQuery();

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: Home, colorClass: 'text-primary' },
    { id: 'properties', label: 'Property Management', icon: Building, colorClass: 'text-success' },
    { id: 'tenants', label: 'Tenant Management', icon: Users, colorClass: 'text-info' },
    { id: 'maintenance', label: 'Maintenance Requests', icon: Settings, colorClass: 'text-warning' },
    { id: 'finances', label: 'Financial Management', icon: DollarSign, colorClass: 'text-danger' },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart3, colorClass: 'text-secondary' },
    { id: 'notifications', label: 'Notifications', icon: Bell, colorClass: 'text-info' },
    { id: 'documents', label: 'Document Management', icon: FileText, colorClass: 'text-dark' },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      dispatch(logout());
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const handleQuickAction = (actionType) => {
    setQuickActionType(actionType);
    setShowQuickActionModal(true);
  };

  const executeQuickAction = () => {
    switch (quickActionType) {
      case 'add-property':
        setActiveTab('properties');
        break;
      case 'add-tenant':
        setActiveTab('tenants');
        break;
      case 'schedule-inspection':
        setActiveTab('maintenance');
        break;
      case 'generate-report':
        setActiveTab('reports');
        break;
      default:
        break;
    }
    setShowQuickActionModal(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'maintenance':
        return <MaintenanceRequests />;
      case 'reports':
        return <AnalyticReports />;
      case 'notifications':
        return <Notification />;
      case 'tenants':
        return <TenantManagement />;
      case 'finances':
        return <FinancialManagement />;
      case 'overview':
        return <OverviewContent stats={dashboardStats} isLoading={isLoading} />;
      case 'properties':
        return <PropertiesManagementContent />;
      case 'documents':
        return <DocumentManagementContent />;
      default:
        return <OverviewContent stats={dashboardStats} isLoading={isLoading} />;
    }
  };

  if (isLoading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? 280 : 80, minHeight: '100vh', background: '#fff', boxShadow: '0 0 8px rgba(0,0,0,0.06)' }}>
        <div className="d-flex flex-column" style={{ height: '100%' }}>
          {/* Logo/Header */}
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
            {sidebarOpen && (
              <div>
                <h4 className="mb-0 fw-bold text-dark">RentSpot</h4>
                <small className="text-muted">Landlord Portal</small>
              </div>
            )}
            <Button
              variant="light"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-grow-1 p-3">
            <div className="d-flex flex-column" style={{ gap: '0.5rem' }}>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    variant={activeTab === item.id ? 'primary' : 'light'}
                    className="d-flex align-items-center justify-content-start border-0"
                    style={{ padding: '0.75rem 1rem', textAlign: 'left' }}
                  >
                    <Icon size={20} className={activeTab === item.id ? 'text-white' : item.colorClass} />
                    {sidebarOpen && <span className="ms-3 fw-semibold">{item.label}</span>}
                  </Button>
                );
              })}
            </div>
          </nav>

          {/* Enhanced User Profile & Logout */}
          <div className="p-3 border-top">
            <div className="d-flex align-items-center mb-3">
              <Dropdown>
                <Dropdown.Toggle
                  as="div"
                  className="d-flex align-items-center"
                  style={{ cursor: 'pointer' }}
                  id="user-dropdown"
                >
                  <div 
                    className="text-white rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '48px', height: '48px', backgroundColor: '#0d6efd' }}
                  >
                    <span className="fw-bold">
                      {user?.name?.charAt(0) || 'L'}
                    </span>
                  </div>
                  {sidebarOpen && (
                    <div className="ms-3 flex-grow-1">
                      <p className="mb-0 fw-semibold text-dark">{user?.name || 'Landlord'}</p>
                      <small className="text-muted">{user?.role || 'Property Owner'}</small>
                    </div>
                  )}
                </Dropdown.Toggle>

                {sidebarOpen && (
                  <Dropdown.Menu className="w-100 shadow-lg border-0">
                    <Dropdown.Header>
                      <div className="text-center">
                        <div className="fw-semibold">{user?.name || 'Landlord'}</div>
                        <small className="text-muted">{user?.email}</small>
                      </div>
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => setShowProfileModal(true)}>
                      <Users size={16} className="me-2" />
                      My Profile
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setActiveTab('notifications')}>
                      <Bell size={16} className="me-2" />
                      Notifications
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setActiveTab('documents')}>
                      <FileText size={16} className="me-2" />
                      Documents
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item 
                      className="text-danger"
                      onClick={() => setShowLogoutModal(true)}
                    >
                      <LogOut size={16} className="me-2" />
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                )}
              </Dropdown>
            </div>
            
            {!sidebarOpen && (
              <Button
                onClick={() => setShowLogoutModal(true)}
                variant="outline-danger"
                size="sm"
                className="w-100"
              >
                <LogOut size={18} />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ background: '#fff', boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}>
          <div className="d-flex justify-content-between align-items-center p-4">
            <div>
              <h2 className="mb-1 fw-bold text-dark">
                {sidebarItems.find(item => item.id === activeTab)?.label || activeTab}
              </h2>
              <p className="mb-0 text-muted">Manage your rental properties efficiently</p>
            </div>
            
            <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Button variant="light" className="p-2 rounded-circle">
                  <Bell size={20} />
                </Button>
                <Badge pill bg="danger" style={{ position: 'absolute', top: -4, right: -6, fontSize: '0.6rem' }}>3</Badge>
              </div>
              
              <div className="text-end">
                <p className="mb-0 small fw-medium text-dark">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main style={{ overflow: 'auto', padding: '1.5rem', backgroundColor: '#f8f9fa', flexGrow: 1 }}>
          {renderContent()}
        </main>
      </div>

      {/* Modern Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <Modal.Body className="text-center p-5">
          <div className="mb-4">
            <div 
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#fee2e2', 
                borderRadius: '50%' 
              }}
            >
              <LogOut size={32} className="text-danger" />
            </div>
            <h4 className="fw-bold text-dark mb-2">Confirm Logout</h4>
            <p className="text-muted mb-0">Are you sure you want to logout? You'll need to sign in again to access your dashboard.</p>
          </div>
          
          <div className="d-flex gap-3 justify-content-center">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
              style={{ minWidth: '100px' }}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{ minWidth: '100px' }}
            >
              {isLoggingOut ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Logging out...
                </>
              ) : (
                'Yes, Logout'
              )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* User Profile Modal */}
      <UserProfileModal 
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        user={user}
      />

      {/* Quick Action Confirmation Modal */}
      <QuickActionModal
        show={showQuickActionModal}
        onHide={() => setShowQuickActionModal(false)}
        actionType={quickActionType}
        onConfirm={executeQuickAction}
      />
    </div>
  );
};

// Enhanced Overview Content Component with functional Quick Actions
const OverviewContent = ({ stats, isLoading }) => {
  const metrics = [
    {
      title: 'Total Properties',
      value: stats?.totalProperties || 0,
      icon: Building,
      bgColor: 'primary',
      trend: '+2 this month',
      trendColor: 'text-success'
    },
    {
      title: 'Active Tenants',
      value: stats?.totalTenants || 0,
      icon: UserCheck,
      bgColor: 'success',
      trend: '+5 this month',
      trendColor: 'text-success'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats?.monthlyRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      bgColor: 'warning',
      trend: '+12% from last month',
      trendColor: 'text-success'
    },
    {
      title: 'Pending Maintenance',
      value: stats?.pendingMaintenance || 0,
      icon: Clock,
      bgColor: 'danger',
      trend: '-3 from last week',
      trendColor: 'text-danger'
    },
    {
      title: 'Occupancy Rate',
      value: `${stats?.occupancyRate || 0}%`,
      icon: TrendingUp,
      bgColor: 'info',
      trend: '+2% this quarter',
      trendColor: 'text-success'
    }
  ];

  const quickActions = [
    { 
      id: 'add-property',
      icon: Plus, 
      label: 'Add New Property', 
      variant: 'outline-primary',
      description: 'Add a new rental property to your portfolio'
    },
    { 
      id: 'add-tenant',
      icon: UserCheck, 
      label: 'Add New Tenant', 
      variant: 'outline-success',
      description: 'Register a new tenant to one of your properties'
    },
    { 
      id: 'schedule-inspection',
      icon: Calendar, 
      label: 'Schedule Inspection', 
      variant: 'outline-info',
      description: 'Schedule a property inspection or maintenance check'
    },
    { 
      id: 'generate-report',
      icon: FileText, 
      label: 'Generate Report', 
      variant: 'outline-warning',
      description: 'Create financial or property performance reports'
    }
  ];

  return (
    <Container fluid>
      {/* Welcome Section */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body 
          className="p-4 text-white"
          style={{ background: 'linear-gradient(135deg, #6f42c1 0%, #007bff 100%)' }}
        >
          <Row className="align-items-center">
            <Col>
              <h2 className="mb-2 fw-bold">Welcome back!</h2>
              <p className="mb-0" style={{ opacity: 0.85 }}>Here's what's happening with your properties today.</p>
            </Col>
            <Col xs="auto" className="d-none d-md-block">
              <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Home size={48} className="text-white" />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Col key={index} xs={12} md={6} lg className="d-flex">
              <Card className="border-0 shadow-sm flex-fill">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className={`p-3 rounded text-white bg-${metric.bgColor}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={24} />
                    </div>
                  </div>
                  <div>
                    <p className="text-muted mb-1 small">{metric.title}</p>
                    <h3 className="mb-2 fw-bold text-dark">{metric.value}</h3>
                    <p className={`small mb-0 ${metric.trendColor}`}>{metric.trend}</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Enhanced Quick Actions & Recent Activity */}
      <Row className="g-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Quick Actions</h5>
              <Badge bg="primary" className="rounded-pill">4 Available</Badge>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button 
                      key={action.id}
                      variant={action.variant} 
                      className="d-flex align-items-center justify-content-start p-3 text-start"
                      onClick={() => handleQuickAction(action.id)}
                      style={{ transition: 'all 0.2s ease' }}
                    >
                      <Icon size={20} className="me-3 flex-shrink-0" />
                      <div>
                        <div className="fw-semibold">{action.label}</div>
                        <small className="opacity-75">{action.description}</small>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Recent Activity</h5>
              <Eye size={20} className="text-muted" />
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column" style={{ gap: '0.75rem' }}>
                {[
                  { icon: CheckCircle2, colorClass: 'text-success', title: 'Maintenance Completed', subtitle: 'Property A - Unit 101', time: '2h ago' },
                  { icon: DollarSign, colorClass: 'text-success', title: 'Rent Payment Received', subtitle: '$1,200 from John Smith', time: '4h ago' },
                  { icon: AlertCircle, colorClass: 'text-warning', title: 'New Maintenance Request', subtitle: 'Property B - Unit 205', time: '6h ago' },
                  { icon: Users, colorClass: 'text-primary', title: 'New Tenant Application', subtitle: 'Sarah Johnson - Property C', time: '1d ago' }
                ].map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="d-flex align-items-center p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: 6 }}>
                      <Icon size={20} className={`me-3 ${activity.colorClass}`} />
                      <div className="flex-grow-1">
                        <p className="mb-0 fw-semibold small">{activity.title}</p>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>{activity.subtitle}</p>
                      </div>
                      <small className="text-muted ms-4">{activity.time}</small>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// User Profile Modal Component
const UserProfileModal = ({ show, onHide, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    address: user?.address || '',
    bio: user?.bio || ''
  });

  const handleSave = () => {
    // Implement save functionality
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center">
          <Users size={24} className="me-2 text-primary" />
          My Profile
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4">
        <Row>
          <Col md={4} className="text-center mb-4">
            <div 
              className="mx-auto mb-3 d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ 
                width: '120px', 
                height: '120px', 
                backgroundColor: '#0d6efd',
                borderRadius: '50%',
                fontSize: '3rem'
              }}
            >
              {user?.name?.charAt(0) || 'L'}
            </div>
            <h5 className="fw-bold">{user?.name || 'Landlord'}</h5>
            <p className="text-muted mb-3">{user?.role || 'Property Owner'}</p>
            
            <div className="d-grid gap-2">
              <Button 
                variant={isEditing ? "success" : "primary"} 
                size="sm"
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
              >
                {isEditing ? (
                  <>
                    <CheckCircle2 size={16} className="me-1" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit size={16} className="me-1" />
                    Edit Profile
                  </>
                )}
              </Button>
              {isEditing && (
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </Col>
          
          <Col md={8}>
            <Form>
              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={!isEditing}
                      placeholder="+254 xxx xxx xxx"
                    />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Company</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Property Management Co."
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Address</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  disabled={!isEditing}
                  placeholder="City, Country"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                />
              </Form.Group>
            </Form>
            
            {/* Profile Stats */}
            <div className="mt-4 p-3 bg-light rounded">
              <h6 className="fw-bold mb-3">Account Statistics</h6>
              <Row className="text-center">
                <Col>
                  <div className="fw-bold text-primary">5</div>
                  <small className="text-muted">Properties</small>
                </Col>
                <Col>
                  <div className="fw-bold text-success">12</div>
                  <small className="text-muted">Tenants</small>
                </Col>
                <Col>
                  <div className="fw-bold text-info">3</div>
                  <small className="text-muted">Years Active</small>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

// Quick Action Confirmation Modal
const QuickActionModal = ({ show, onHide, actionType, onConfirm }) => {
  const getActionDetails = () => {
    switch (actionType) {
      case 'add-property':
        return {
          title: 'Add New Property',
          description: 'You will be redirected to the Property Management section where you can add a new rental property to your portfolio.',
          icon: Building,
          color: 'primary'
        };
      case 'add-tenant':
        return {
          title: 'Add New Tenant',
          description: 'You will be redirected to the Tenant Management section where you can register a new tenant.',
          icon: UserCheck,
          color: 'success'
        };
      case 'schedule-inspection':
        return {
          title: 'Schedule Inspection',
          description: 'You will be redirected to the Maintenance section where you can schedule property inspections.',
          icon: Calendar,
          color: 'info'
        };
      case 'generate-report':
        return {
          title: 'Generate Report',
          description: 'You will be redirected to the Reports section where you can create financial and property reports.',
          icon: FileText,
          color: 'warning'
        };
      default:
        return {
          title: 'Quick Action',
          description: 'Perform this action.',
          icon: Plus,
          color: 'primary'
        };
    }
  };

  const details = getActionDetails();
  const Icon = details.icon;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="text-center p-4">
        <div className="mb-4">
          <div 
            className={`mx-auto mb-3 d-flex align-items-center justify-content-center`}
            style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: `var(--bs-${details.color})`,
              borderRadius: '50%',
              opacity: 0.1
            }}
          >
            <Icon size={32} className={`text-${details.color}`} />
          </div>
          <h4 className="fw-bold text-dark mb-2">{details.title}</h4>
          <p className="text-muted mb-0">{details.description}</p>
        </div>
        
        <div className="d-flex gap-3 justify-content-center">
          <Button variant="outline-secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant={details.color} onClick={onConfirm}>
            Continue
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

// Placeholder components using Bootstrap only
const PropertiesManagementContent = () => (
  <Container fluid>
    <Row className="mb-4">
      <Col>
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="fw-bold mb-0">Property Portfolio</h3>
          <Button variant="primary" className="d-flex align-items-center">
            <Plus size={16} className="me-2" />
            Add Property
          </Button>
        </div>
      </Col>
    </Row>
    <Card className="border-0 shadow-sm">
      <Card.Body className="text-center py-5">
        <Building size={64} className="text-muted mb-4" />
        <h4 className="fw-semibold mb-3">Property Management System</h4>
        <p className="text-muted mb-4">Manage all your rental properties, track occupancy, and monitor property performance.</p>
        <Row className="g-3">
          {[
            { title: 'Property Listings', desc: 'Add, edit, and manage property details', color: 'primary' },
            { title: 'Occupancy Tracking', desc: 'Monitor vacant and occupied units', color: 'success' },
            { title: 'Property Analytics', desc: 'Performance metrics and insights', color: 'info' }
          ].map((item, index) => (
            <Col key={index} md={4}>
              <Card className={`h-100 border-${item.color}`}>
                <Card.Body>
                  <h6 className={`text-${item.color} fw-semibold`}>{item.title}</h6>
                  <small className="text-muted">{item.desc}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  </Container>
);

const TenantManagementContent = () => (
  <Container fluid>
    <Row className="mb-4">
      <Col>
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="fw-bold mb-0">Tenant Management</h3>
          <Button variant="success" className="d-flex align-items-center">
            <UserCheck size={16} className="me-2" />
            Add Tenant
          </Button>
        </div>
      </Col>
    </Row>
    <Card className="border-0 shadow-sm">
      <Card.Body className="text-center py-5">
        <Users size={64} className="text-muted mb-4" />
        <h4 className="fw-semibold mb-3">Comprehensive Tenant Management</h4>
        <p className="text-muted mb-4">Handle tenant applications, lease agreements, and communication efficiently.</p>
        <Row className="g-3">
          {[
            { title: 'Applications', desc: 'Review tenant applications', color: 'primary' },
            { title: 'Lease Management', desc: 'Create and manage leases', color: 'success' },
            { title: 'Communication', desc: 'Message tenants directly', color: 'warning' },
            { title: 'Background Checks', desc: 'Verify tenant credentials', color: 'info' }
          ].map((item, index) => (
            <Col key={index} md={3}>
              <Card className={`h-100 border-${item.color}`}>
                <Card.Body>
                  <h6 className={`text-${item.color} fw-semibold`}>{item.title}</h6>
                  <small className="text-muted">{item.desc}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  </Container>
);

const FinancialManagementContent = () => (
  <Container fluid>
    <Row className="mb-4">
      <Col>
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="fw-bold mb-0">Financial Management</h3>
          <Button variant="warning" className="d-flex align-items-center">
            <DollarSign size={16} className="me-2" />
            Add Transaction
          </Button>
        </div>
      </Col>
    </Row>
    <Card className="border-0 shadow-sm">
      <Card.Body className="text-center py-5">
        <DollarSign size={64} className="text-muted mb-4" />
        <h4 className="fw-semibold mb-3">Complete Financial Overview</h4>
        <p className="text-muted mb-4">Track rental income, expenses, and generate financial reports.</p>
        <Row className="g-3">
          {[
            { title: 'Rent Collection', desc: 'Track payments and overdue rent', color: 'success' },
            { title: 'Expense Tracking', desc: 'Monitor property expenses', color: 'danger' },
            { title: 'Financial Reports', desc: 'Generate income statements', color: 'primary' },
            { title: 'Tax Documents', desc: 'Prepare tax-related documents', color: 'info' }
          ].map((item, index) => (
            <Col key={index} md={3}>
              <Card className={`h-100 border-${item.color}`}>
                <Card.Body>
                  <h6 className={`text-${item.color} fw-semibold`}>{item.title}</h6>
                  <small className="text-muted">{item.desc}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  </Container>
);

const DocumentManagementContent = () => (
  <Container fluid>
    <Row className="mb-4">
      <Col>
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="fw-bold mb-0">Document Management</h3>
          <Button variant="info" className="d-flex align-items-center">
            <FileText size={16} className="me-2" />
            Upload Document
          </Button>
        </div>
      </Col>
    </Row>
    <Card className="border-0 shadow-sm">
      <Card.Body className="text-center py-5">
        <FileText size={64} className="text-muted mb-4" />
        <h4 className="fw-semibold mb-3">Centralized Document Storage</h4>
        <p className="text-muted mb-4">Store and manage all property-related documents securely.</p>
        <Row className="g-3">
          {[
            { title: 'Lease Agreements', desc: 'Store all lease documents', color: 'primary' },
            { title: 'Property Documents', desc: 'Deeds, insurance, certificates', color: 'success' },
            { title: 'Tenant Records', desc: 'Applications, ID copies', color: 'warning' },
            { title: 'Legal Documents', desc: 'Contracts, notices, compliance', color: 'info' }
          ].map((item, index) => (
            <Col key={index} md={3}>
              <Card className={`h-100 border-${item.color}`}>
                <Card.Body>
                  <h6 className={`text-${item.color} fw-semibold`}>{item.title}</h6>
                  <small className="text-muted">{item.desc}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  </Container>
);

export default LandlordDashboard;
