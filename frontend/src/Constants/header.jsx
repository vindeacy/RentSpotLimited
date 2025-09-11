import { Navbar, Container, Nav } from "react-bootstrap";

export default function Header() {
  return (
    <Navbar
      expand="lg"
      sticky="top"
      style={{ backgroundColor: "#4B2E09" }} // Dark brown
      variant="dark"
    >
      <Container>
        <Navbar.Brand href="/">RentSpot</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/search">Search</Nav.Link>
            <Nav.Link href="/login">Login</Nav.Link>
            <Nav.Link href="/register">Register</Nav.Link>
            <Nav.Link href="#contact">Contact Us</Nav.Link>
            {/* Add more links as needed */}
          </Nav>
        </Navbar.Collapse>
        </Container>
    </Navbar>
    );
}