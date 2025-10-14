import { useState, useEffect } from "react";
import { Row, Col, Badge, Button, Card, Table, Form, ListGroup, Modal } from "react-bootstrap";
import Profile from "./profile.jsx";
import PropertyDetails from "../LandlordDahboard/propertyManagement.jsx";

import Maintenance from "./Maintenance.jsx";
import Reviews from "./Reviews.jsx";

const API_BASE_URL = 'http://localhost:5000/api';

// Dummy data for demonstration
const rentals = [
  {
    id: "APT-101",
    address: "Westlands, Nairobi",
    landlord: "Jane Mwangi",
    rent: 35000,
    lease: "2025-01-01 to 2025-12-31",
    status: "Active"
  }
];

const payments = [
  { id: "INV-1001", month: "July 2025", amount: 35000, status: "Paid", method: "M-Pesa", date: "2025-07-01" },
  { id: "INV-1002", month: "August 2025", amount: 35000, status: "Due", method: "-", date: "2025-08-01" }
];

const maintenance = [
  { id: 1, issue: "Leaky kitchen sink", status: "Pending", date: "2025-07-10" },
  { id: 2, issue: "Bedroom lights flickering", status: "Resolved", date: "2025-06-28" }
];

const reviews = [
  { id: 1, target: "Jane Mwangi", rating: 5, comment: "Responsive landlord!", date: "2025-07-11" },
  { id: 2, target: "Westlands Apartment", rating: 4, comment: "Clean and secure.", date: "2025-06-30" }
];

const notifications = [
  { id: 1, title: "Rent Due", message: "Your August rent is due soon.", time: "2h ago", unread: true },
  { id: 2, title: "Policy Update", message: "New visitor policy effective August.", time: "1d ago", unread: false }
];

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { key: "profile", label: "Profile", icon: "bi-person-fill" },
  { key: "rentals", label: "My Rentals", icon: "bi-house-door-fill" },
  { key: "payments", label: "Payments", icon: "bi-wallet2" },
  { key: "maintenance", label: "Maintenance", icon: "bi-tools" },
  { key: "reviews", label: "Reviews", icon: "bi-star-fill" },
  { key: "notifications", label: "Notifications", icon: "bi-bell-fill" }
];

// Rentals Component with PropertyDetails modal
function Rentals() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  function handleShowDetails(rental) {
    setSelectedRental(rental);
    setShowDetails(true);
  }

  function handleClose() {
    setShowDetails(false);
    setSelectedRental(null);
  }

  return (
    <>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h4 className="mb-3">My Rentals</h4>
          <Table hover responsive bordered>
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Address</th>
                <th>Landlord</th>
                <th>Rent (KSh)</th>
                <th>Lease</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.address}</td>
                  <td>{r.landlord}</td>
                  <td>{r.rent.toLocaleString()}</td>
                  <td>{r.lease}</td>
                  <td>
                    <Badge bg={r.status === "Active" ? "success" : "secondary"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleShowDetails(r)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal for Property Details */}
      <Modal show={showDetails} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Property Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRental ? (
            <PropertyDetails property={selectedRental} />
          ) : (
            <div>No property selected.</div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

// Payments Component - Modernized with payment method selection
function Payments() {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    { 
      value: 'mpesa', 
      label: 'M-Pesa', 
      icon: 'bi-phone', 
      color: 'success',
      description: 'Pay using your M-Pesa mobile money',
      instructions: 'You will receive an STK push to complete payment'
    },
    { 
      value: 'bank', 
      label: 'Bank Transfer', 
      icon: 'bi-bank', 
      color: 'primary',
      description: 'Transfer directly from your bank account',
      instructions: 'Use the provided bank details to transfer'
    },
    { 
      value: 'card', 
      label: 'Credit/Debit Card', 
      icon: 'bi-credit-card', 
      color: 'info',
      description: 'Pay securely with your card',
      instructions: 'Visa, Mastercard, and other cards accepted'
    },
    { 
      value: 'paypal', 
      label: 'PayPal', 
      icon: 'bi-paypal', 
      color: 'warning',
      description: 'Pay using your PayPal account',
      instructions: 'You will be redirected to PayPal'
    }
  ];

  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentMethods(true);
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setShowPaymentMethods(false);
    setShowPaymentDetails(true);
  };

  const handlePaymentSubmit = async () => {
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Show success message
      alert(`Payment of KSh ${selectedPayment.amount.toLocaleString()} processed successfully via ${selectedMethod.label}!`);
      
      // Close modals and reset
      setShowPaymentDetails(false);
      setSelectedPayment(null);
      setSelectedMethod(null);
      
    } catch (error) {
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  return (
    <>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h4 className="mb-3">Payments & Rent History</h4>
          <Table hover responsive bordered>
            <thead className="table-light">
              <tr>
                <th>Invoice</th>
                <th>Month</th>
                <th>Amount (KSh)</th>
                <th>Status</th>
                <th>Method</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.month}</td>
                  <td>{p.amount.toLocaleString()}</td>
                  <td>
                    <Badge bg={p.status === "Paid" ? "success" : "warning"}>{p.status}</Badge>
                  </td>
                  <td>{p.method}</td>
                  <td>{p.date}</td>
                  <td>
                    {p.status === "Paid" ? (
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => handleDownloadReceipt(p)}
                      >
                        <i className="bi bi-download me-1"></i>
                        Receipt
                      </Button>
                    ) : (
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handlePayNow(p)}
                      >
                        <i className="bi bi-credit-card me-1"></i>
                        Pay Now
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Payment Methods Selection Modal */}
      <Modal show={showPaymentMethods} onHide={() => setShowPaymentMethods(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <i className="bi bi-credit-card text-primary"></i>
            Choose Payment Method
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="pt-2">
          {selectedPayment && (
            <>
              <div className="bg-light rounded-3 p-3 mb-4">
                <h6 className="mb-2">Payment Summary</h6>
                <div className="d-flex justify-content-between mb-1">
                  <span>Amount to Pay:</span>
                  <strong className="text-primary">KSh {selectedPayment.amount.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Due Date:</span>
                  <span>{selectedPayment.date}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Invoice:</span>
                  <span>{selectedPayment.id}</span>
                </div>
              </div>

              <h6 className="mb-3">Select your preferred payment method:</h6>
              
              <Row className="g-3">
                {paymentMethods.map((method) => (
                  <Col md={6} key={method.value}>
                    <Card 
                      className="h-100 payment-method-card" 
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: '2px solid #e9ecef'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `var(--bs-${method.color})`;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e9ecef';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      onClick={() => handleMethodSelect(method)}
                    >
                      <Card.Body className="text-center p-4">
                        <div className={`bg-${method.color} bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3`}>
                          <i className={`bi ${method.icon} fs-2 text-${method.color}`}></i>
                        </div>
                        <h6 className="mb-2">{method.label}</h6>
                        <p className="text-muted small mb-2">{method.description}</p>
                        <small className="text-muted">{method.instructions}</small>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              <div className="mt-4 p-3 bg-info bg-opacity-10 rounded-3">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1"></i>
                  All payments are secured with 256-bit SSL encryption. Your financial information is safe with us.
                </small>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Payment Details Modal */}
      <Modal show={showPaymentDetails} onHide={() => setShowPaymentDetails(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            {selectedMethod && (
              <>
                <i className={`bi ${selectedMethod.icon} text-${selectedMethod.color}`}></i>
                Pay with {selectedMethod.label}
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {selectedPayment && selectedMethod && (
            <>
              <div className="bg-light rounded-3 p-3 mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Amount:</span>
                  <strong>KSh {selectedPayment.amount.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Payment Method:</span>
                  <span className="d-flex align-items-center">
                    <i className={`bi ${selectedMethod.icon} me-1`}></i>
                    {selectedMethod.label}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Invoice:</span>
                  <span>{selectedPayment.id}</span>
                </div>
              </div>

              {selectedMethod.value === 'mpesa' && (
                <div className="mb-3">
                  <Form.Group className="mb-3">
                    <Form.Label>M-Pesa Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="254712345678"
                      pattern="[0-9]{12}"
                      required
                    />
                    <Form.Text className="text-muted">
                      Enter your M-Pesa registered phone number
                    </Form.Text>
                  </Form.Group>
                </div>
              )}

              {selectedMethod.value === 'card' && (
                <div className="mb-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Card Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Expiry Date</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="MM/YY"
                          maxLength="5"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>CVV</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="123"
                          maxLength="4"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              )}

              {selectedMethod.value === 'bank' && (
                <div className="mb-3">
                  <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                    <h6>Bank Transfer Details:</h6>
                    <p className="mb-1"><strong>Bank:</strong> Equity Bank Kenya</p>
                    <p className="mb-1"><strong>Account Name:</strong> RentSpot Limited</p>
                    <p className="mb-1"><strong>Account Number:</strong> 1234567890</p>
                    <p className="mb-0"><strong>Reference:</strong> {selectedPayment.id}</p>
                  </div>
                </div>
              )}

              {selectedMethod.value === 'paypal' && (
                <div className="mb-3">
                  <div className="bg-info bg-opacity-10 rounded-3 p-3">
                    <h6>PayPal Payment</h6>
                    <p className="mb-0">You will be redirected to PayPal to complete your payment securely.</p>
                  </div>
                </div>
              )}

              <div className="bg-success bg-opacity-10 rounded-3 p-3 mb-3">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  {selectedMethod.instructions}
                </small>
              </div>
            </>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              setShowPaymentDetails(false);
              setShowPaymentMethods(true);
            }}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Back
          </Button>
          <Button 
            variant={selectedMethod?.color || 'primary'}
            onClick={handlePaymentSubmit}
            disabled={processing}
            className="px-4"
          >
            {processing ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Processing...
              </>
            ) : (
              <>
                <i className="bi bi-lock me-1"></i>
                Pay KSh {selectedPayment ? selectedPayment.amount.toLocaleString() : '0'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Receipt Modal */}
      <Modal show={showReceiptModal} onHide={() => setShowReceiptModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Payment Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <div>
              <div className="text-center mb-4">
                <i className="bi bi-receipt fs-1 text-success mb-2 d-block"></i>
                <h5>Payment Receipt</h5>
                <p className="text-muted">Receipt #{selectedPayment.id}</p>
              </div>
              <div className="border rounded-3 p-3">
                <div className="row mb-2">
                  <div className="col-6">Amount Paid:</div>
                  <div className="col-6 text-end fw-bold">KSh {selectedPayment.amount.toLocaleString()}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6">Payment Method:</div>
                  <div className="col-6 text-end">{selectedPayment.method}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6">Date Paid:</div>
                  <div className="col-6 text-end">{selectedPayment.date}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6">Invoice:</div>
                  <div className="col-6 text-end">{selectedPayment.id}</div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-6 fw-bold">Status:</div>
                  <div className="col-6 text-end">
                    <Badge bg="success">Paid</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReceiptModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            <i className="bi bi-printer me-1"></i>
            Print Receipt
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

// Dashboard Overview Component
function DashboardOverview() {
  const [loading, setLoading] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  
  const totalRent = rentals.reduce((sum, rental) => sum + rental.rent, 0);
  const paidPayments = payments.filter(p => p.status === "Paid").length;
  const pendingMaintenance = maintenance.filter(m => m.status === "Pending").length;
  const unreadNotifications = notifications.filter(n => n.unread).length;

  useEffect(() => {
    setAnimationClass('animate__animated animate__fadeInUp');
  }, []);

  const handleQuickAction = (action) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      switch(action) {
        case 'pay':
          setShowPayModal(true);
          break;
        case 'maintenance':
          setShowMaintenanceModal(true);
          break;
        case 'contact':
          setShowContactModal(true);
          break;
        default:
          alert(`${action} feature coming soon!`);
      }
    }, 1000);
  };

  return (
    <div className={animationClass}>
      {/* Welcome Header */}
      <div className="mb-4 p-4 rounded-4" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Row className="align-items-center">
          <Col md={8}>
            <h3 className="mb-2 fw-bold">Welcome back! 👋</h3>
            <p className="mb-0 opacity-75">Here's what's happening with your rental today</p>
          </Col>
          <Col md={4} className="text-end">
            <div className="d-flex align-items-center justify-content-end">
              <i className="bi bi-calendar3 me-2"></i>
              <span>{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </Col>
        </Row>
      </div>
      
      {/* Enhanced Summary Cards */}
      <Row className="mb-4 g-4">
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-lg h-100" style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            transform: 'translateY(0)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 small">ACTIVE RENTALS</p>
                  <h2 className="mb-0 fw-bold">{rentals.length}</h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3">
                  <i className="bi bi-house-door-fill fs-3"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-arrow-up me-1"></i>
                <small>Updated today</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-lg h-100" style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            transform: 'translateY(0)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 small">MONTHLY RENT</p>
                  <h2 className="mb-0 fw-bold">KSh {totalRent.toLocaleString()}</h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3">
                  <i className="bi bi-wallet2 fs-3"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-calendar-check me-1"></i>
                <small>Due: Aug 1st</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-lg h-100" style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            transform: 'translateY(0)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 small">PENDING ISSUES</p>
                  <h2 className="mb-0 fw-bold">{pendingMaintenance}</h2>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3">
                  <i className="bi bi-tools fs-3"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-clock me-1"></i>
                <small>Last updated: 2h ago</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-lg h-100" style={{
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#2d3748',
            transform: 'translateY(0)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 small">NEW MESSAGES</p>
                  <h2 className="mb-0 fw-bold">{unreadNotifications}</h2>
                </div>
                <div className="bg-white bg-opacity-50 rounded-circle p-3">
                  <i className="bi bi-bell-fill fs-3 text-primary"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-dot"></i>
                <small>Last message: 2h ago</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions & Recent Activity */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="border-0 shadow-lg h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-lightning-fill fs-4 text-primary"></i>
                </div>
                <div>
                  <h5 className="mb-1">Quick Actions</h5>
                  <p className="text-muted mb-0 small">Manage your rental with one click</p>
                </div>
              </div>
              
              <div className="d-grid gap-3">
                <Button 
                  variant="outline-primary" 
                  className="d-flex align-items-center justify-content-start p-3 border-2"
                  disabled={loading}
                  onClick={() => handleQuickAction('pay')}
                  style={{ borderRadius: '12px' }}
                >
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="bi bi-credit-card text-primary"></i>
                  </div>
                  <div className="text-start">
                    <div className="fw-medium">Pay Rent</div>
                    <small className="text-muted">KSh 35,000 due Aug 1st</small>
                  </div>
                  {loading && <div className="spinner-border spinner-border-sm ms-auto"></div>}
                </Button>

                <Button 
                  variant="outline-success" 
                  className="d-flex align-items-center justify-content-start p-3 border-2"
                  disabled={loading}
                  onClick={() => handleQuickAction('maintenance')}
                  style={{ borderRadius: '12px' }}
                >
                  <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="bi bi-plus-circle text-success"></i>
                  </div>
                  <div className="text-start">
                    <div className="fw-medium">Submit Maintenance Request</div>
                    <small className="text-muted">Report any issues quickly</small>
                  </div>
                </Button>

                <Button 
                  variant="outline-info" 
                  className="d-flex align-items-center justify-content-start p-3 border-2"
                  disabled={loading}
                  onClick={() => handleQuickAction('contact')}
                  style={{ borderRadius: '12px' }}
                >
                  <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="bi bi-envelope text-info"></i>
                  </div>
                  <div className="text-start">
                    <div className="fw-medium">Contact Landlord</div>
                    <small className="text-muted">Jane Mwangi</small>
                  </div>
                </Button>

                <Button 
                  variant="outline-warning" 
                  className="d-flex align-items-center justify-content-start p-3 border-2"
                  disabled={loading}
                  onClick={() => handleQuickAction('review')}
                  style={{ borderRadius: '12px' }}
                >
                  <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                    <i className="bi bi-star text-warning"></i>
                  </div>
                  <div className="text-start">
                    <div className="fw-medium">Leave Review</div>
                    <small className="text-muted">Rate your experience</small>
                  </div>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card className="border-0 shadow-lg h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="bi bi-credit-card-2-front fs-4 text-success"></i>
                  </div>
                  <div>
                    <h5 className="mb-1">Recent Payments</h5>
                    <p className="text-muted mb-0 small">Your payment history</p>
                  </div>
                </div>
                <Badge bg="success" pill>{paidPayments} Paid</Badge>
              </div>
              
              <div className="space-y-3">
                {payments.slice(0, 3).map((payment, index) => (
                  <div key={payment.id} className="d-flex align-items-center p-3 rounded-3 bg-light">
                    <div className={`rounded-circle p-2 me-3 ${
                      payment.status === 'Paid' ? 'bg-success text-white' : 'bg-warning text-white'
                    }`}>
                      <i className={`bi ${payment.status === 'Paid' ? 'bi-check-lg' : 'bi-clock'}`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium">{payment.month}</div>
                      <small className="text-muted">KSh {payment.amount.toLocaleString()} • {payment.method || 'Pending'}</small>
                    </div>
                    <Badge bg={payment.status === "Paid" ? "success" : "warning"}>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Enhanced Current Property Info */}
      <Row>
        <Col md={12}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="bi bi-building fs-4 text-primary"></i>
                </div>
                <div>
                  <h5 className="mb-1">Current Property</h5>
                  <p className="text-muted mb-0 small">Your rental information</p>
                </div>
              </div>

              {rentals.length > 0 ? (
                <div className="bg-light rounded-4 p-4">
                  <Row className="align-items-center">
                    <Col lg={8}>
                      <div className="d-flex align-items-center">
                        <div className="bg-white rounded-3 p-4 me-4 shadow-sm">
                          <i className="bi bi-geo-alt-fill fs-2 text-primary"></i>
                        </div>
                        <div>
                          <h4 className="mb-2 fw-bold">{rentals[0].address}</h4>
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-person-circle me-2 text-muted"></i>
                            <span className="text-muted">Landlord: {rentals[0].landlord}</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-calendar-range me-2 text-muted"></i>
                            <span className="text-muted">Lease: {rentals[0].lease}</span>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col lg={4} className="text-lg-end text-center mt-lg-0 mt-3">
                      <div className="mb-3">
                        <Badge bg="success" className="px-3 py-2 fs-6">
                          <i className="bi bi-check-circle me-1"></i>
                          {rentals[0].status}
                        </Badge>
                      </div>
                      <div className="bg-white rounded-3 p-3 shadow-sm">
                        <div className="text-muted small mb-1">Monthly Rent</div>
                        <h3 className="text-success mb-0 fw-bold">
                          KSh {rentals[0].rent.toLocaleString()}
                        </h3>
                      </div>
                    </Col>
                  </Row>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="bg-light rounded-circle p-4 d-inline-flex mb-3">
                    <i className="bi bi-house-x fs-1 text-muted"></i>
                  </div>
                  <h6 className="text-muted">No active rentals found</h6>
                  <p className="text-muted small">Contact your landlord to get started</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment Modal */}
      <Modal show={showPayModal} onHide={() => setShowPayModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pay Rent</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount (KSh)</Form.Label>
              <Form.Control type="number" value="35000" readOnly />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select>
                <option>M-Pesa</option>
                <option>Bank Transfer</option>
                <option>Credit Card</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPayModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            alert('Payment processed successfully!');
            setShowPayModal(false);
          }}>
            Process Payment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Maintenance Modal */}
      <Modal show={showMaintenanceModal} onHide={() => setShowMaintenanceModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Submit Maintenance Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Issue Category</Form.Label>
              <Form.Select>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Heating/Cooling</option>
                <option>Security</option>
                <option>Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Describe the issue..." />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMaintenanceModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={() => {
            alert('Maintenance request submitted successfully!');
            setShowMaintenanceModal(false);
          }}>
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Contact Modal */}
      <Modal show={showContactModal} onHide={() => setShowContactModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Contact Landlord</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control type="text" placeholder="Enter subject..." />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control as="textarea" rows={4} placeholder="Type your message..." />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowContactModal(false)}>
            Cancel
          </Button>
          <Button variant="info" onClick={() => {
            alert('Message sent to landlord successfully!');
            setShowContactModal(false);
          }}>
            Send Message
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

// Reviews Component - rename to avoid conflict with imported Reviews
function ReviewsWrapper() {
  const [reviewTarget, setReviewTarget] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewTarget || !comment.trim()) {
      alert('Please fill in all fields');
      return;
    }
    
    alert('Review submitted successfully!');
    setReviewTarget('');
    setRating(5);
    setComment('');
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <h4 className="mb-3">Reviews / Feedback</h4>
        <Form className="mb-3" onSubmit={handleSubmitReview}>
          <Row className="g-2">
            <Col md={4}>
              <Form.Select 
                value={reviewTarget} 
                onChange={(e) => setReviewTarget(e.target.value)}
              >
                <option value="">Select Target</option>
                <option value="property">Rate Property</option>
                <option value="landlord">Rate Landlord</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r>1 && "s"}</option>)}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Control 
                placeholder="Write your feedback..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Col>
          </Row>
          <div className="d-flex justify-content-end mt-2">
            <Button type="submit" variant="primary">Submit Review</Button>
          </div>
        </Form>
        <Table hover responsive bordered>
          <thead className="table-light">
            <tr>
              <th>Target</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id}>
                <td>{r.target}</td>
                <td>
                  <Badge bg={r.rating >= 4 ? "success" : "secondary"}>{r.rating}</Badge>
                </td>
                <td>{r.comment}</td>
                <td>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

// Notifications Component
function Notifications() {
  const [notificationList, setNotificationList] = useState(notifications);

  const markAsRead = (id) => {
    setNotificationList(prev => 
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  const markAllAsRead = () => {
    setNotificationList(prev => 
      prev.map(n => ({ ...n, unread: false }))
    );
  };

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newNotification = {
          id: Date.now(),
          title: "New Update",
          message: "You have a new message from your landlord.",
          time: "Just now",
          unread: true
        };
        setNotificationList(prev => [newNotification, ...prev]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Notifications</h4>
          <Button variant="link" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        </div>
        <ListGroup>
          {notificationList.length === 0 ? (
            <ListGroup.Item className="text-center text-muted">
              No new notifications
            </ListGroup.Item>
          ) : (
            notificationList.map(notification => (
              <ListGroup.Item
                key={notification.id}
                className={`d-flex justify-content-between align-items-center ${
                  notification.unread ? 'bg-light' : ''
                }`}
                style={{ cursor: 'pointer' }}
                onClick={() => markAsRead(notification.id)}
              >
                <div>
                  <strong>{notification.title}</strong>
                  {notification.unread && <Badge bg="primary" className="ms-2">New</Badge>}
                  <div className="text-muted small">{notification.message}</div>
                </div>
                <small className="text-muted">{notification.time}</small>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}


export default function Dashboard() {
  const [active, setActive] = useState("dashboard");

  function renderContent() {
    switch (active) {
      case "dashboard": return <DashboardOverview />;
      case "profile": return <Profile />;
      case "rentals": return <Rentals />;
      case "payments": return <Payments />;
      case "maintenance": return <Maintenance />;
      case "reviews": return <Reviews />; 
      case "notifications": return <Notifications />;
      default: return null;
    }
  }

  return (
    <div style={{ minHeight: "90vh", background: "#f5f7fa" }}>
      <div className="d-flex" style={{ height: "100%" }}>
        {/* Sidebar */}
        <div
          className="bg-white p-4 border-end"
          style={{
            minWidth: "230px",
            boxShadow: "0 0 10px rgba(0,0,0,0.05)"
          }}
        >
          <h4 className="mb-4 fw-bold">
            <i className="bi bi-house-door-fill me-2"></i>Tenant Dashboard
          </h4>
          <ul className="nav flex-column">
            {sidebarItems.map(item => (
              <li key={item.key} className="nav-item mb-2">
                <button
                  className={`nav-link w-100 text-start d-flex align-items-center gap-2 ${
                    active === item.key ? "active bg-primary text-white" : "text-dark"
                  }`}
                  style={{
                    border: "none",
                    background: active === item.key ? "#7c4dff" : "none",
                    fontWeight: active === item.key ? "bold" : "normal",
                    borderRadius: "6px",
                    padding: "10px 15px",
                    cursor: "pointer"
                  }}
                  onClick={() => setActive(item.key)}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span className="flex-grow-1">{item.label}</span>
                  {item.key === "notifications" && notifications.some(n => n.unread) && (
                    <Badge bg="danger" pill>!</Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>  
        {/* Main Content */}
        <div className="flex-grow-1 p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}