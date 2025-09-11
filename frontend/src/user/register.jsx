import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const role = 'tenant'; // Assign default role here
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await res.json();
      if (!res.ok) {
         if (data.error && data.error.toLowerCase().includes('user already exists')) {
          // Navigate to login page if user already exists
          navigate('/login');
        } else {
          setError(data.error || 'Registration failed');
        }
      } else {
        setSuccess('Registration successful! You can now log in.');
        setEmail('');
        setName('');
        setPassword('');
        //redirect to login page after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 2000); // 2 seconds delay to show success message
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  }

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Form onSubmit={handleSubmit} className="p-4 border rounded shadow bg-white">
            <h2 className="mb-4 text-center">Register</h2>
            {error && <Alert variant="danger">{error}</Alert>}
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
            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}