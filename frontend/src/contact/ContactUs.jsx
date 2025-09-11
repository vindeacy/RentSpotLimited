import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Container, Row, Col } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import { FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    message: ''
  });

  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setResult('Sending...');

    const formSubmission = new FormData();
    formSubmission.append('access_key', '59f841df-79d1-4586-8993-080c023d201c');
    formSubmission.append('name', formData.name);
    formSubmission.append('email', formData.email);
    formSubmission.append('message', formData.message);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formSubmission
      });

      const data = await response.json();

      if (data.success) {
        setResult('Message sent successfully!');
        toast.success('Message sent successfully!', { position: 'top-center' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setResult('Failed to send message. Please try again.');
        toast.error('Failed to send message. Please try again.', { position: 'top-center' });
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.', { position: 'top-center' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div id="contact" style={{ background: "#f5f7fa", minHeight: "100vh", padding: "40px 0" }}>
      <Container>
        <Row className="align-items-center justify-content-center">
          {/* Contact Form */}
          <Col xs={12} md={6} className="mb-4 mb-md-0">
            <div className="p-4 rounded shadow" style={{ background: "#f5e9da" }}>
              <h2 className="mb-3 text-primary">Contact Us</h2>
              <p className="mb-4 text-muted">Let's get in touch about your rental needs!</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-control"
                    rows={4}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSending}
                  className="btn btn-primary w-100"
                >
                  {isSending ? 'Sending...' : 'Send Message'}
                </button>
                <span className="text-muted mt-2 d-block">{result}</span>
              </form>
<div className="mt-4">
  <h5 className="mb-2">Email</h5>
  <a href="mailto:deacyvin@gmail.com" className="btn btn-outline-danger w-100 mb-2 d-flex align-items-center justify-content-center gap-2">
    <FaEnvelope /> deacyvin@gmail.com
  </a>
  <h5 className="mt-3 mb-2"> Reach me:</h5>
  <div className="d-flex flex-column gap-2">
    <a href="tel:+254746051906" className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2">
      <FaPhoneAlt /> 
    </a>
    <a href="sms:+254746051906" className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center gap-2">
      <FaEnvelope /> 
    </a>
    <a
      href="https://wa.me/254757579824"
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-outline-success w-100"
      style={{ backgroundColor: "#25D366", color: "#fff", border: "none" }}
    >
 <FaWhatsapp /> 
    </a>
  </div>
</div>
            </div>
          </Col>
          {/* Map */}
<Col xs={12} md={6} lg={6}>
            <div className="bg-white p-4 rounded shadow h-100 d-flex align-items-center justify-content-center" style={{ minHeight: "400px" }}>
              <iframe
                title="My Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.0079823536!2d36.821946!3d-1.292066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d1b1b1b1b1%3A0x1b1b1b1b1b1b1b1b!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1630000000000!5m2!1sen!2ske"
                width="100%"
                height="350"
                style={{ border: 0, borderRadius: '0.5rem' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </Col>
        </Row>
      </Container>
      <ToastContainer />
    </div>
  );
};

export default ContactUs;