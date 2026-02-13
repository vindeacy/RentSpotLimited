import React, { useState } from 'react';
import { Modal, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { Plus } from 'lucide-react';
import { useCreateTenantMutation } from '../../store/api/tenantApi';

const AddTenantModal = ({ show, onHide }) => {
  const [createTenant, { isLoading, error }] = useCreateTenantMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employmentStatus: 'Employed',
    kraPin: '',
    dob: '',
    moveInDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTenant(formData).unwrap();
      setFormData({ name: '', email: '', phone: '', employmentStatus: 'Employed', kraPin: '', dob: '', moveInDate: '' });
      onHide(); // Close on success
    } catch (err) {
      console.error('Failed to save the tenant: ', err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Register New Tenant</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="bg-light p-4">
          {error && <Alert variant="danger">Error: {error.data?.message || 'Failed to create tenant'}</Alert>}
          
          <Row className="g-3">
            <Col md={12}><h6 className="text-primary border-bottom pb-2">Personal Information</h6></Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Full Name</Form.Label>
                <Form.Control required name="name" value={formData.name} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control required type="email" name="email" value={formData.email} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Employment Status</Form.Label>
                <Form.Select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange}>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Unemployed">Unemployed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Move-in Date</Form.Label>
                <Form.Control type="date" name="moveInDate" value={formData.moveInDate} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancel</Button>
          <Button variant="success" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : <><Plus size={16} className="me-2" />Add Tenant</>}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddTenantModal;