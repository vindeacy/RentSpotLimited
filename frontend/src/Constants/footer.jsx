import { Container, Row, Col } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';

const tags = [
  "awareness", "contemporary", "economy living", "image post",
  "interior", "living rooms", "studio", "trendy"
];

export default function Footer() {
  return (
    <footer style={{ background: "#232323", color: "#f5f5f5", fontSize: "1rem" }} className="pt-5 pb-3 mt-auto">
      <Container>
        <Row>
          {/* Navigation */}
          <Col md={3} className="mb-4 mb-md-0">
            <h5 className="text-white mb-3 fw-bold">RentSpot</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light text-decoration-none">Home</a></li>
              <li><a href="/dashboard" className="text-light text-decoration-none">Dashboard</a></li>
              <li><a href="/news" className="text-light text-decoration-none">News</a></li>
              <li><a href="#contact" className="text-light text-decoration-none">Contact</a></li>
            </ul>
          </Col>
          {/* Layout Links */}
          <Col md={3} className="mb-4 mb-md-0">
            <h6 className="text-white mb-3 fw-bold">Explore</h6>
            <ul className="list-unstyled">
              <li><a href="/listings" className="text-light text-decoration-none">List Layout</a></li>
              <li><a href="/grid" className="text-light text-decoration-none">Grid Layout</a></li>
              <li><a href="/faq" className="text-light text-decoration-none">FAQ</a></li>
              <li><a href="/terms" className="text-light text-decoration-none">Terms</a></li>
            </ul>
          </Col>
          {/* Contact Info */}
          <Col md={3} className="mb-4 mb-md-0">
            <h6 className="text-white mb-3 fw-bold">Contact</h6>
            <div className="mb-2">
              <i className="bi bi-geo-alt-fill me-2"></i>
              Nairobi, Kenya
            </div>
            <div className="mb-2">
              <i className="bi bi-telephone-fill me-2"></i>
              <a href="tel:+254746051906" className="text-light text-decoration-none">+2547 4605 1906</a>
            </div>
            <div className="mb-2">
              <i className="bi bi-envelope-fill me-2"></i>
              <a href="mailto:deacyvin@gmail.com" className="text-light text-decoration-none">deacyvin@gmail.com</a>
            </div>
          </Col>
          {/* Tags & Socials */}
          <Col md={3}>
            <h6 className="text-white mb-3 fw-bold">Tags</h6>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span key={tag} className="badge bg-info text-dark">{tag}</span>
              ))}
            </div>
            <div className="d-flex gap-3 mb-2">
              <a href="https://linkedin.com/in/vindeacy" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <i className="bi bi-linkedin" style={{ fontSize: "1.5rem", color: "#0A66C2" }}></i>
              </a>
              <a href="https://twitter.com/deacyvin" target="_blank" rel="noopener noreferrer" title="Twitter">
                <i className="bi bi-twitter" style={{ fontSize: "1.5rem", color: "#1DA1F2" }}></i>
              </a>
              <a href="https://github.com/deacyvin" target="_blank" rel="noopener noreferrer" title="GitHub">
                <i className="bi bi-github" style={{ fontSize: "1.5rem", color: "#fff" }}></i>
              </a>
            </div>
          </Col>
        </Row>
        <hr style={{ borderColor: "#444" }} />
        <Row>
          <Col className="text-center text-light" style={{ fontSize: "0.95rem" }}>
            &copy; {new Date().getFullYear()} Deacy Vincensher Odhiambo. All rights reserved.<br />
            Built with <span className="text-info">React</span> & <span className="text-info">Bootstrap</span>.
          </Col>
        </Row>
      </Container>
    </footer>
  );
}