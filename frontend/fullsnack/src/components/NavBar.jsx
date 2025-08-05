import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/esm/Button";
import { logoutUser } from "../api";

function NavBar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/");  // 👈 redirect to Home after logout
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Home {user?.first_name && `- ${user.first_name}`}
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