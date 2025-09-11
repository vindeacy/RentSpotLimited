import  { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch profile on mount
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load profile');
        } else {
          setProfile(data);
          setForm({ name: data.name || '', email: data.email || '' });
        }
      } catch {
        setError('Network error');
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  // Handle form changes
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handle profile update
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Update failed');
      } else {
        setSuccess('Profile updated!');
        setProfile(data);
        setEditMode(false);
      }
    } catch {
      setError('Network error');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card className="mx-auto mt-5" style={{ maxWidth: 500 }}>
      <Card.Body>
        <Card.Title>Tenant Profile</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        {!editMode ? (
          <>
            <div className="mb-3"><strong>Name:</strong> {profile?.name}</div>
            <div className="mb-3"><strong>Email:</strong> {profile?.email}</div>
            <Button variant="outline-primary" onClick={() => setEditMode(true)}>
              Edit Profile
            </Button>
          </>
        ) : (
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>{' '}  
            <Button variant="secondary" onClick={() => setEditMode(false)} disabled={saving}>
              Cancel
            </Button>
            </Form>
        )}
        </Card.Body>
    </Card>
    );
}