import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  X, 
  Eye, 
  EyeOff,
  Trash2,
  Filter,
  Search,
  Calendar,
  User,
  Home,
  DollarSign,
  Settings
} from 'lucide-react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Dropdown } from 'react-bootstrap';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMarkAllModal, setShowMarkAllModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time notifications (WebSocket connection)
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/landlord/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/landlord/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true, readAt: new Date() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/landlord/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true, readAt: new Date() }))
      );
      setShowMarkAllModal(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/landlord/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'maintenance': return <Settings className="text-warning" size={20} />;
      case 'payment': return <DollarSign className="text-success" size={20} />;
      case 'tenant': return <User className="text-info" size={20} />;
      case 'property': return <Home className="text-primary" size={20} />;
      case 'system': return <Info className="text-secondary" size={20} />;
      case 'alert': return <AlertCircle className="text-danger" size={20} />;
      default: return <Bell className="text-muted" size={20} />;
    }
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'maintenance': return 'warning';
      case 'payment': return 'success';
      case 'tenant': return 'info';
      case 'property': return 'primary';
      case 'system': return 'secondary';
      case 'alert': return 'danger';
      default: return 'light';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.read) ||
                         (filter === 'read' && notification.read) ||
                         notification.type === filter;
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getNotificationStats = () => {
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      today: notifications.filter(n => {
        const today = new Date().toDateString();
        return new Date(n.createdAt).toDateString() === today;
      }).length
    };
  };

  const stats = getNotificationStats();

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{height: '300px'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Notifications</h2>
              <p className="text-muted mb-0">Stay updated with your property activities</p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                onClick={() => setShowMarkAllModal(true)}
                disabled={stats.unread === 0}
              >
                <CheckCircle size={16} className="me-2" />
                Mark All Read
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary text-white rounded p-3 me-3">
                  <Bell size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Total Notifications</p>
                  <h3 className="mb-0 fw-bold">{stats.total}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-warning text-white rounded p-3 me-3">
                  <EyeOff size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Unread</p>
                  <h3 className="mb-0 fw-bold">{stats.unread}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-info text-white rounded p-3 me-3">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Today</p>
                  <h3 className="mb-0 fw-bold">{stats.today}</h3>
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
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{paddingLeft: '2.5rem'}}
                />
              </div>
            </Col>
            
            <Col lg={6}>
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
                <option value="maintenance">Maintenance</option>
                <option value="payment">Payments</option>
                <option value="tenant">Tenant Related</option>
                <option value="property">Property Updates</option>
                <option value="system">System Alerts</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Notifications List */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <div 
                key={notification._id} 
                className={`p-4 border-bottom ${!notification.read ? 'bg-light' : ''}`}
              >
                <Row>
                  <Col xs="auto">
                    {getNotificationIcon(notification.type)}
                  </Col>
                  
                  <Col>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className={`mb-0 ${!notification.read ? 'fw-bold' : 'fw-medium'}`}>
                            {notification.title}
                          </h6>
                          <Badge bg={getNotificationTypeColor(notification.type)} className="text-capitalize">
                            {notification.type}
                          </Badge>
                          {!notification.read && (
                            <Badge bg="primary" className="rounded-pill">New</Badge>
                          )}
                        </div>
                        
                        <p className="text-muted mb-2 small">{notification.message}</p>
                        
                        <div className="d-flex align-items-center gap-3 text-muted small">
                          <span>
                            <Calendar size={14} className="me-1" />
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                          {notification.read && (
                            <span>
                              <Eye size={14} className="me-1" />
                              Read {new Date(notification.readAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Dropdown>
                        <Dropdown.Toggle variant="light" size="sm" className="border-0">
                          <span className="visually-hidden">Actions</span>
                          ⋮
                        </Dropdown.Toggle>
                        
                        <Dropdown.Menu>
                          {!notification.read && (
                            <Dropdown.Item onClick={() => markAsRead(notification._id)}>
                              <Eye size={14} className="me-2" />
                              Mark as Read
                            </Dropdown.Item>
                          )}
                          <Dropdown.Item onClick={() => setSelectedNotification(notification)}>
                            <Info size={14} className="me-2" />
                            View Details
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item 
                            className="text-danger"
                            onClick={() => deleteNotification(notification._id)}
                          >
                            <Trash2 size={14} className="me-2" />
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </Col>
                </Row>
              </div>
            ))
          ) : (
            <div className="text-center py-5">
              <Bell size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No notifications found</h5>
              <p className="text-muted">You're all caught up! Check back later for updates.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Mark All as Read Modal */}
      <Modal show={showMarkAllModal} onHide={() => setShowMarkAllModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Mark All as Read</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to mark all {stats.unread} unread notifications as read?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMarkAllModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <Modal 
          show={!!selectedNotification} 
          onHide={() => setSelectedNotification(null)} 
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center gap-2">
              {getNotificationIcon(selectedNotification.type)}
              {selectedNotification.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <Badge bg={getNotificationTypeColor(selectedNotification.type)} className="text-capitalize mb-2">
                {selectedNotification.type}
              </Badge>
              {!selectedNotification.read && (
                <Badge bg="primary" className="rounded-pill ms-2">New</Badge>
              )}
            </div>
            
            <p className="mb-3">{selectedNotification.message}</p>
            
            <div className="text-muted small">
              <p className="mb-1">
                <strong>Created:</strong> {new Date(selectedNotification.createdAt).toLocaleString()}
              </p>
              {selectedNotification.read && (
                <p className="mb-1">
                  <strong>Read:</strong> {new Date(selectedNotification.readAt).toLocaleString()}
                </p>
              )}
              {selectedNotification.data && (
                <div className="mt-3">
                  <strong>Additional Information:</strong>
                  <pre className="bg-light p-2 rounded mt-1" style={{fontSize: '0.8rem'}}>
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            {!selectedNotification.read && (
              <Button 
                variant="primary" 
                onClick={() => {
                  markAsRead(selectedNotification._id);
                  setSelectedNotification(null);
                }}
              >
                Mark as Read
              </Button>
            )}
            <Button variant="secondary" onClick={() => setSelectedNotification(null)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default Notification;
