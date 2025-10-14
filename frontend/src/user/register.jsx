import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../store/api/authApi';
import housekey from '../images/housekey.png'; 
import { Form, Button, Alert, Container, Row, Col, Image } from 'react-bootstrap';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tenant');
  const [success, setSuccess] = useState('');

  const [register, { isLoading, error }] = useRegisterMutation();

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess('');
    
    try {
      const result = await register({ email, password, name, role }).unwrap();
      
      setSuccess('Registration successful! You can now log in.');
      setEmail('');
      setName('');
      setPassword('');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.data?.error && err.data.error.toLowerCase().includes('user already exists')) {
        navigate('/login');
      }
      // Error is automatically handled by RTK Query
    }
  }

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100 shadow-lg rounded overflow-hidden" style={{ maxWidth: '900px' }}>
        
        {/* Left column: Image */}
        <Col md={6} className="d-none d-md-flex p-0">
          <Image 
            src={housekey}
            alt="Welcome to RentSpot"
            className="w-100 h-100 object-fit-cover"
            style={{ objectFit: 'cover' }}
          />
        </Col>

        <span 
          className="d-none d-md-block position-absolute" 
          style={{
            left: '50%',
            top: '0',
            bottom: '0',
            width: '2px',
            backgroundColor: '#dee2e6',
            transform: 'translateX(-50%)',
            zIndex: 1
          }}
        ></span>

        {/* Right column: Form */}
        <Col xs={12} md={6} className="bg-white p-4">
          <Form onSubmit={handleSubmit} className="h-100 d-flex flex-column justify-content-center">
            <h2 className="mb-4 text-center">Register</h2>
            {error && (
              <Alert variant="danger">
                {error.data?.error || error.message || 'Registration failed'}
              </Alert>
            )}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formRole">
              <Form.Label>I am a</Form.Label>
              <Form.Select
                value={role}
                onChange={e => setRole(e.target.value)}
                required
              >
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
              </Form.Select>
            </Form.Group>
            
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
            
            {/* Already have an account link */}
            <div className="text-center mt-3">
              <p className="mb-0">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 text-decoration-none"
                  onClick={() => navigate('/login')}
                >
                  Login here
                </Button>
              </p>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
