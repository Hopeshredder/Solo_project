import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/esm/Button";
import { logoutUser } from "../api";

function NavBar({ user, setUser }) {
  const handleLogout = () => {
    logoutUser();
    setUser("");
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Home {user ? `- ${user}` : ""}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!user ? (
              <Nav.Link as={Link} to="/signup/">
                Sign Up
              </Nav.Link>
            ) : null}
            {!user ? (
              <Nav.Link as={Link} to="/login/">
                Log In
              </Nav.Link>
            ) : null}
            {user ? (
              <Button onClick={handleLogout} variant="outline-danger">
                Log Out
              </Button>
            ) : null}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;