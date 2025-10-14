import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Eye, 
  Download, 
  CreditCard, 
  Smartphone, 
  Building, 
  Calendar,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText
} from 'lucide-react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Table, Tabs, Tab } from 'react-bootstrap';
import { 
  useGetTransactionsQuery, 
  useCreateTransactionMutation,
  useGetRentCollectionsQuery,
  useGetExpensesQuery,
  useGetFinancialSummaryQuery 
} from '../../store/api/financialApi';

const FinancialManagement = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactionType, setTransactionType] = useState('income');
  const [dateFilter, setDateFilter] = useState('this-month');
  const [searchTerm, setSearchTerm] = useState('');

  // API calls
  const { data: transactionsData, isLoading: transactionsLoading } = useGetTransactionsQuery();
  const { data: rentData, isLoading: rentLoading } = useGetRentCollectionsQuery();
  const { data: expensesData, isLoading: expensesLoading } = useGetExpensesQuery();
  const { data: summaryData, isLoading: summaryLoading } = useGetFinancialSummaryQuery();

  const transactions = transactionsData?.transactions || [];
  const rentCollections = rentData?.rentCollections || [];
  const expenses = expensesData?.expenses || [];
  const summary = summaryData || {};

  const formatKES = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'mpesa': return <Smartphone className="text-success" size={16} />;
      case 'mobile banking': return <CreditCard className="text-primary" size={16} />;
      case 'paypal': return <CreditCard className="text-info" size={16} />;
      default: return <CreditCard className="text-secondary" size={16} />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { bg: 'success', text: 'Paid' },
      pending: { bg: 'warning', text: 'Pending' },
      overdue: { bg: 'danger', text: 'Overdue' },
      partial: { bg: 'info', text: 'Partial' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Financial Management</h2>
              <p className="text-muted mb-0">Track rental income, expenses, and generate financial reports.</p>
            </div>
            <Button variant="warning" onClick={() => setShowAddModal(true)}>
              <DollarSign size={16} className="me-2" />
              Add Transaction
            </Button>
          </div>
        </Col>
      </Row>

      {/* Financial Summary Cards */}
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success text-white rounded p-3 me-3">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Total Income</p>
                  <h3 className="mb-0 fw-bold">{formatKES(summary.totalIncome || 0)}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-danger text-white rounded p-3 me-3">
                  <TrendingDown size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Total Expenses</p>
                  <h3 className="mb-0 fw-bold">{formatKES(summary.totalExpenses || 0)}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary text-white rounded p-3 me-3">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Net Profit</p>
                  <h3 className="mb-0 fw-bold">{formatKES((summary.totalIncome || 0) - (summary.totalExpenses || 0))}</h3>
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
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-muted mb-1 small">Overdue Rent</p>
                  <h3 className="mb-0 fw-bold">{formatKES(summary.overdueRent || 0)}</h3>
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
            className={`border-success h-100 cursor-pointer ${activeSection === 'rent-collection' ? 'bg-success-subtle' : ''}`}
            onClick={() => setActiveSection('rent-collection')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center py-4">
              <CheckCircle size={48} className="text-success mb-3" />
              <h6 className="text-success fw-semibold">Rent Collection</h6>
              <small className="text-muted">Track payments and overdue rent</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card 
            className={`border-danger h-100 cursor-pointer ${activeSection === 'expense-tracking' ? 'bg-danger-subtle' : ''}`}
            onClick={() => setActiveSection('expense-tracking')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center py-4">
              <TrendingDown size={48} className="text-danger mb-3" />
              <h6 className="text-danger fw-semibold">Expense Tracking</h6>
              <small className="text-muted">Monitor property expenses</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card 
            className={`border-primary h-100 cursor-pointer ${activeSection === 'financial-reports' ? 'bg-primary-subtle' : ''}`}
            onClick={() => setActiveSection('financial-reports')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center py-4">
              <FileText size={48} className="text-primary mb-3" />
              <h6 className="text-primary fw-semibold">Financial Reports</h6>
              <small className="text-muted">Generate income statements</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card 
            className={`border-info h-100 cursor-pointer ${activeSection === 'tax-documents' ? 'bg-info-subtle' : ''}`}
            onClick={() => setActiveSection('tax-documents')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center py-4">
              <FileText size={48} className="text-info mb-3" />
              <h6 className="text-info fw-semibold">Tax Documents</h6>
              <small className="text-muted">Prepare tax-related documents</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Content Based on Active Section */}
      {activeSection === 'overview' && (
        <TransactionsOverview transactions={transactions} loading={transactionsLoading} />
      )}

      {activeSection === 'rent-collection' && (
        <RentCollectionSection rentCollections={rentCollections} loading={rentLoading} />
      )}

      {activeSection === 'expense-tracking' && (
        <ExpenseTrackingSection expenses={expenses} loading={expensesLoading} />
      )}

      {activeSection === 'financial-reports' && (
        <FinancialReportsSection summary={summary} />
      )}

      {activeSection === 'tax-documents' && (
        <TaxDocumentsSection />
      )}

      {/* Default view - Transactions Overview */}
      {!['rent-collection', 'expense-tracking', 'financial-reports', 'tax-documents'].includes(activeSection) && (
        <TransactionsOverview transactions={transactions} loading={transactionsLoading} />
      )}

      {/* Add Transaction Modal */}
      <AddTransactionModal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)} 
      />
    </Container>
  );
};

// Transactions Overview Component
const TransactionsOverview = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const formatKES = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'mpesa': return <Smartphone className="text-success" size={16} />;
      case 'mobile banking': return <CreditCard className="text-primary" size={16} />;
      case 'paypal': return <CreditCard className="text-info" size={16} />;
      default: return <CreditCard className="text-secondary" size={16} />;
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Transactions</h5>
          <div className="d-flex gap-2">
            <Form.Select size="sm" style={{width: '150px'}}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Form.Select>
            <Button variant="outline-primary" size="sm">
              <Filter size={14} className="me-1" />
              Filter
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        {transactions.length > 0 ? (
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Property</th>
                <th>Type</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>
                    <div className="fw-medium">{transaction.description}</div>
                    {transaction.reference && (
                      <small className="text-muted">Ref: {transaction.reference}</small>
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <Building size={14} className="me-2 text-muted" />
                      {transaction.property?.name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <Badge bg={transaction.type === 'income' ? 'success' : 'danger'}>
                      {transaction.type}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                      <span className="ms-2">{transaction.paymentMethod}</span>
                    </div>
                  </td>
                  <td className={`fw-medium ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatKES(transaction.amount)}
                  </td>
                  <td>
                    <Badge bg={transaction.status === 'completed' ? 'success' : 'warning'}>
                      {transaction.status}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm">
                      <Eye size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center py-5">
            <DollarSign size={48} className="text-muted mb-3" />
            <h5 className="text-muted">No transactions found</h5>
            <p className="text-muted">Start by adding your first transaction.</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Rent Collection Section
const RentCollectionSection = ({ rentCollections, loading }) => {
  const formatKES = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" /></div>;
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header>
        <h5 className="mb-0">Rent Collection</h5>
      </Card.Header>
      <Card.Body>
        <Row className="g-4">
          {rentCollections.map((rent) => (
            <Col key={rent._id} md={6} lg={4}>
              <Card className="border h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="mb-1">{rent.tenant?.name}</h6>
                      <small className="text-muted">{rent.property?.name}</small>
                    </div>
                    <Badge bg={rent.status === 'paid' ? 'success' : rent.status === 'overdue' ? 'danger' : 'warning'}>
                      {rent.status}
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Amount:</span>
                      <span className="fw-medium">{formatKES(rent.amount)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Due Date:</span>
                      <span>{new Date(rent.dueDate).toLocaleDateString()}</span>
                    </div>
                    {rent.paidDate && (
                      <div className="d-flex justify-content-between">
                        <span>Paid Date:</span>
                        <span>{new Date(rent.paidDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {rent.status !== 'paid' && (
                    <div className="d-flex gap-2">
                      <Button variant="success" size="sm" className="flex-fill">
                        Mark Paid
                      </Button>
                      <Button variant="outline-primary" size="sm">
                        <Eye size={14} />
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {rentCollections.length === 0 && (
          <div className="text-center py-4">
            <CheckCircle size={48} className="text-muted mb-3" />
            <p className="text-muted">No rent collections to display</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Expense Tracking Section
const ExpenseTrackingSection = ({ expenses, loading }) => {
  const formatKES = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" /></div>;
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Expense Tracking</h5>
        <Button variant="danger" size="sm">
          <PlusCircle size={14} className="me-1" />
          Add Expense
        </Button>
      </Card.Header>
      <Card.Body>
        {expenses.length > 0 ? (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Property</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>{expense.description}</td>
                  <td>
                    <Badge bg="secondary">{expense.category}</Badge>
                  </td>
                  <td>{expense.property?.name || 'General'}</td>
                  <td className="fw-medium text-danger">{formatKES(expense.amount)}</td>
                  <td>
                    <Button variant="outline-primary" size="sm">
                      <Eye size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center py-4">
            <TrendingDown size={48} className="text-muted mb-3" />
            <p className="text-muted">No expenses recorded</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Financial Reports Section
const FinancialReportsSection = ({ summary }) => (
  <Card className="border-0 shadow-sm">
    <Card.Header><h5 className="mb-0">Financial Reports</h5></Card.Header>
    <Card.Body>
      <div className="text-center py-4">
        <FileText size={48} className="text-muted mb-3" />
        <h6>Generate Financial Reports</h6>
        <p className="text-muted">Generate detailed financial reports for tax and accounting purposes.</p>
        <div className="d-flex gap-2 justify-content-center">
          <Button variant="primary">
            <Download size={14} className="me-1" />
            Monthly Report
          </Button>
          <Button variant="outline-primary">
            <Download size={14} className="me-1" />
            Annual Report
          </Button>
        </div>
      </div>
    </Card.Body>
  </Card>
);

// Tax Documents Section
const TaxDocumentsSection = () => (
  <Card className="border-0 shadow-sm">
    <Card.Header><h5 className="mb-0">Tax Documents</h5></Card.Header>
    <Card.Body>
      <div className="text-center py-4">
        <FileText size={48} className="text-muted mb-3" />
        <h6>Tax Document Management</h6>
        <p className="text-muted">Prepare and manage tax-related documents for KRA compliance.</p>
        <Button variant="info">
          <Download size={14} className="me-1" />
          Generate Tax Report
        </Button>
      </div>
    </Card.Body>
  </Card>
);

// Add Transaction Modal
const AddTransactionModal = ({ show, onHide }) => {
  const [formData, setFormData] = useState({
    type: 'income',
    description: '',
    amount: '',
    paymentMethod: 'mpesa',
    property: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    reference: ''
  });

  const [createTransaction] = useCreateTransactionMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTransaction(formData).unwrap();
      setFormData({
        type: 'income',
        description: '',
        amount: '',
        paymentMethod: 'mpesa',
        property: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        reference: ''
      });
      onHide();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Transaction</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Transaction Type</Form.Label>
                <Form.Select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Amount (KES)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter transaction description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  required
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="mobile banking">Mobile Banking</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {formData.type === 'income' ? (
                    <>
                      <option value="rent">Rent Payment</option>
                      <option value="deposit">Security Deposit</option>
                      <option value="late_fee">Late Fee</option>
                      <option value="other_income">Other Income</option>
                    </>
                  ) : (
                    <>
                      <option value="maintenance">Maintenance</option>
                      <option value="utilities">Utilities</option>
                      <option value="insurance">Insurance</option>
                      <option value="taxes">Taxes</option>
                      <option value="management">Management Fee</option>
                      <option value="advertising">Advertising</option>
                      <option value="other_expense">Other Expense</option>
                    </>
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Reference Number (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Transaction reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Transaction
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default FinancialManagement;
