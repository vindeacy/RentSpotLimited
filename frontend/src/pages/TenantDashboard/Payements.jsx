import { useState, useEffect } from "react";
import { Row, Col, Badge, Button, Card, Table, Form, Modal, Alert, ProgressBar } from "react-bootstrap";

const API_BASE_URL = 'http://localhost:5000/api/payments';

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

const paymentStatusColors = {
  'pending': 'warning',
  'paid': 'success',
  'overdue': 'danger',
  'partial': 'info'
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'mpesa',
    amount: '',
    reference: ''
  });
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // Get tenant ID from localStorage or context
  const tenantId = localStorage.getItem('tenantId') || 'temp-tenant-id';

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tenant/${tenantId}`);
      if (response.ok) {
        const paymentsData = await response.json();
        setPayments(paymentsData);
      } else {
        setAlertMessage('Failed to load payments');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setAlertMessage('Error loading payments');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    setPaymentForm({
      paymentMethod: '',
      amount: payment.amount.toString(),
      reference: ''
    });
    setShowPaymentMethods(true);
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setPaymentForm(prev => ({ ...prev, paymentMethod: method.value }));
    setShowPaymentMethods(false);
    setShowPaymentDetails(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Simulate payment gateway integration
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch(`${API_BASE_URL}/${selectedPayment.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'paid',
          paidDate: new Date().toISOString(),
          reference: paymentForm.reference,
          notes: `Paid via ${selectedMethod.label}`,
          paymentMethod: selectedMethod.value
        }),
      });

      if (response.ok) {
        const updatedPayment = await response.json();
        setPayments(prev => prev.map(p => 
          p.id === selectedPayment.id ? updatedPayment : p
        ));
        setAlertMessage('Payment processed successfully!');
        setShowAlert(true);
        setShowPaymentDetails(false);
        setSelectedPayment(null);
        setSelectedMethod(null);
        
        // Reset form
        setPaymentForm({
          paymentMethod: '',
          amount: '',
          reference: ''
        });
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.error || 'Payment failed');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setAlertMessage('Error processing payment');
      setShowAlert(true);
    } finally {
      setProcessing(false);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };
    

  const handleDownloadReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const createNewPayment = async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        const newPayment = await response.json();
        setPayments(prev => [newPayment, ...prev]);
        setAlertMessage('Payment record created successfully!');
        setShowAlert(true);
      } else {
        const errorData = await response.json();
        setAlertMessage(errorData.error || 'Failed to create payment');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setAlertMessage('Error creating payment');
      setShowAlert(true);
    }
    setTimeout(() => setShowAlert(false), 5000);
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tenant/${tenantId}/stats`);
      if (response.ok) {
        const statsData = await response.json();
        return statsData;
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
    return null;
  };

  // Enhanced stats calculation with backend data
  const generatePaymentStats = () => {
    const totalPaid = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    const totalPending = payments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const overdueCount = payments.filter(p => {
      return p.status === 'overdue' || 
             (new Date(p.dueDate) < new Date() && p.status !== 'paid');
    }).length;
    
    const paidCount = payments.filter(p => p.status === 'paid').length;

    return { totalPaid, totalPending, overdueCount, paidCount };
  };

  // Enhanced payment status determination
  const getPaymentStatusDisplay = (payment) => {
    if (payment.status === 'paid') return { status: 'paid', color: 'success' };
    if (payment.status === 'overdue') return { status: 'overdue', color: 'danger' };
    if (new Date(payment.dueDate) < new Date() && payment.status !== 'paid') {
      return { status: 'overdue', color: 'danger' };
    }
    return { status: payment.status, color: paymentStatusColors[payment.status] || 'secondary' };
  };

  const getPaymentMethodIcon = (method) => {
    const paymentMethod = paymentMethods.find(pm => pm.value === method);
    return paymentMethod ? paymentMethod.icon : 'bi-credit-card';
  };

  const stats = generatePaymentStats();

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

      {/* Payment Overview Cards */}
      <Row className="mb-4 g-4">
        <Col lg={3} md={6}>
          <Card className="border-0 shadow-lg h-100" style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white'
          }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 small">TOTAL PAID</p>
                  <h3 className="mb-0 fw-bold">KSh {stats.totalPaid.toLocaleString()}</h3>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3">
                  <i className="bi bi-check-circle fs-4"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-arrow-up me-1"></i>
                <small>{stats.paidCount} payments completed</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-lg h-100" style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white'
          }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 small">PENDING AMOUNT</p>
                  <h3 className="mb-0 fw-bold">KSh {stats.totalPending.toLocaleString()}</h3>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3">
                  <i className="bi bi-clock fs-4"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle me-1"></i>
                <small>{stats.overdueCount} overdue payments</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-lg h-100" style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 small">TOTAL PAYMENTS</p>
                  <h3 className="mb-0 fw-bold">{payments.length}</h3>
                </div>
                <div className="bg-white bg-opacity-20 rounded-circle p-3">
                  <i className="bi bi-receipt fs-4"></i>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <i className="bi bi-calendar me-1"></i>
                <small>All time records</small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="border-0 shadow-lg h-100" style={{
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#2d3748'
          }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="mb-1 opacity-75 small">PAYMENT RATE</p>
                  <h3 className="mb-0 fw-bold">
                    {payments.length > 0 ? Math.round((stats.paidCount / payments.length) * 100) : 0}%
                  </h3>
                </div>
                <div className="bg-white bg-opacity-50 rounded-circle p-3">
                  <i className="bi bi-graph-up fs-4 text-primary"></i>
                </div>
              </div>
              <ProgressBar 
                now={payments.length > 0 ? (stats.paidCount / payments.length) * 100 : 0} 
                variant="success" 
                style={{ height: '4px' }} 
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payments Table */}
      <Card className="border-0 shadow-lg">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="mb-1">Payment History</h5>
              <p className="text-muted mb-0 small">Track all your rental payments</p>
            </div>
            <Button variant="outline-primary" onClick={fetchPayments}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </Button>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-credit-card fs-1 text-muted mb-3 d-block"></i>
              <h6 className="text-muted">No payments found</h6>
              <p className="text-muted small mb-0">Your payment history will appear here</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Due Date</th>
                    <th>Property</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Method</th>
                    <th>Paid Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => {
                    const statusDisplay = getPaymentStatusDisplay(payment);
                    return (
                      <tr key={payment.id}>
                        <td>
                          <div className="fw-medium">
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </div>
                          <small className="text-muted">
                            {new Date(payment.dueDate) < new Date() && payment.status !== 'paid' ? 'Overdue' : 'On time'}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-house-door me-2 text-primary"></i>
                            <div>
                              <div className="fw-medium">
                                {payment.lease?.property?.title || 'Property'}
                              </div>
                              <small className="text-muted">
                                {payment.lease?.property?.addressLine || payment.lease?.property?.city}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-primary">
                            KSh {parseFloat(payment.amount).toLocaleString()}
                          </div>
                        </td>
                        <td>
                          <Badge bg={statusDisplay.color} className="text-capitalize">
                            {statusDisplay.status}
                          </Badge>
                        </td>
                        <td>
                          {payment.paymentMethod ? (
                            <div className="d-flex align-items-center">
                              <i className={`bi ${getPaymentMethodIcon(payment.paymentMethod)} me-1`}></i>
                              <span className="text-capitalize">{payment.paymentMethod}</span>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {payment.paidDate ? (
                            <div>
                              <div>{new Date(payment.paidDate).toLocaleDateString()}</div>
                              {payment.reference && (
                                <small className="text-muted">Ref: {payment.reference}</small>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            {payment.status === 'paid' ? (
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleDownloadReceipt(payment)}
                                title="Download Receipt"
                              >
                                <i className="bi bi-download"></i>
                              </Button>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handlePayNow(payment)}
                                title="Process Payment"
                              >
                                Pay Now
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
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
                  <strong className="text-primary">KSh {parseFloat(selectedPayment.amount).toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Due Date:</span>
                  <span>{new Date(selectedPayment.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Property:</span>
                  <span>{selectedPayment.lease?.property?.title || 'N/A'}</span>
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
            <Form onSubmit={handlePaymentSubmit}>
              <div className="bg-light rounded-3 p-3 mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Amount:</span>
                  <strong>KSh {parseFloat(selectedPayment.amount).toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Payment Method:</span>
                  <span className="d-flex align-items-center">
                    <i className={`bi ${selectedMethod.icon} me-1`}></i>
                    {selectedMethod.label}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Property:</span>
                  <span>{selectedPayment.lease?.property?.title}</span>
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

              <Form.Group className="mb-3">
                <Form.Label>Transaction Reference (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter transaction reference"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                />
              </Form.Group>

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
            </Form>
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
                Pay KSh {selectedPayment ? parseFloat(selectedPayment.amount).toLocaleString() : '0'}
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
                  <div className="col-6 text-end fw-bold">KSh {parseFloat(selectedPayment.amount).toLocaleString()}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6">Payment Method:</div>
                  <div className="col-6 text-end text-capitalize">{selectedPayment.paymentMethod || 'N/A'}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6">Date Paid:</div>
                  <div className="col-6 text-end">
                    {selectedPayment.paidDate ? new Date(selectedPayment.paidDate).toLocaleDateString() : '-'}
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-6">Reference:</div>
                  <div className="col-6 text-end">{selectedPayment.reference || '-'}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6">Property:</div>
                  <div className="col-6 text-end">{selectedPayment.lease?.property?.title || '-'}</div>
                </div>
                <div className="row mb-2">
                  <div className="col-6">Lease ID:</div>
                  <div className="col-6 text-end">#{selectedPayment.leaseId}</div>
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
    </div>
  );
}
