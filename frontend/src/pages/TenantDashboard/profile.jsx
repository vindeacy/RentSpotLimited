import { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '../../store/api/userApi';

export default function Profile() {
  const { data, isLoading, error: fetchError, refetch } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update form when data is loaded
  useEffect(() => {
    if (data?.user) {
      setForm({ 
        name: data.user.name || '', 
        email: data.user.email || '' 
      });
    }
  }, [data]);

  // Handle form changes
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handle profile update
  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await updateProfile(form).unwrap();
      setSuccess('Profile updated!');
      setEditMode(false);
      refetch();
    } catch (err) {
      setError(err?.data?.error || 'Update failed');
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <Spinner animation="border" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <Card className="mx-auto mt-5" style={{ maxWidth: 500 }}>
        <Card.Body>
          <Alert variant="danger">
            Failed to load profile: {fetchError?.data?.error || 'Unknown error'}
          </Alert>
          <Button onClick={refetch}>Retry</Button>
        </Card.Body>
      </Card>
    );
  }

  const profile = data?.user;

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
            <div className="mb-3"><strong>Phone:</strong> {profile?.phone || 'Not set'}</div>
            <div className="mb-3"><strong>Role:</strong> {profile?.role}</div>
            {profile?.tenant && (
              <>
                <hr />
                <h5>Tenant Information</h5>
                <div className="mb-3"><strong>Employment Status:</strong> {profile.tenant.employmentStatus || 'Not set'}</div>
                <div className="mb-3"><strong>Rating:</strong> {profile.tenant.rating || 'N/A'}</div>
                <div className="mb-3"><strong>Move-in Date:</strong> {profile.tenant.moveInDate ? new Date(profile.tenant.moveInDate).toLocaleDateString() : 'Not set'}</div>
                {profile.tenant.emergencyContactName && (
                  <>
                    <hr />
                    <h5>Emergency Contact</h5>
                    <div className="mb-3"><strong>Name:</strong> {profile.tenant.emergencyContactName}</div>
                    <div className="mb-3"><strong>Phone:</strong> {profile.tenant.emergencyContactPhone}</div>
                    <div className="mb-3"><strong>Email:</strong> {profile.tenant.emergencyContactEmail || 'Not set'}</div>
                  </>
                )}
              </>
            )}
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
            <Button variant="primary" type="submit" disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>{' '}  
            <Button variant="secondary" onClick={() => setEditMode(false)} disabled={isUpdating}>
              Cancel
            </Button>
            </Form>
        )}
        </Card.Body>
    </Card>
    );
}