import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { logoutUser } from "../api";

function NavBar({ user, setUser }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutUser();
        setUser(null);
        navigate("/");
    };

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container className="flex flex-col items-center">
                {/* Username row */}
                {user?.first_name && (
                    <div className="text-center fw-bold py-1">
                        User – {user.first_name}
                    </div>
                )}

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Centered nav links */}
                    <Nav className="mx-auto d-flex align-items-center gap-3">
                        {!user && (
                            <>
                                <Nav.Link as={Link} to="/signup/">
                                    Sign Up
                                </Nav.Link>
                                <Nav.Link as={Link} to="/login/">
                                    Log In
                                </Nav.Link>
                            </>
                        )}
                        {user && (
                            <>
                                <Nav.Link as={Link} to="/foodlog/">
                                    Food Log
                                </Nav.Link>
                                <Nav.Link as={Link} to="/dashboard/">
                                    Dashboard
                                </Nav.Link>
                                <Button
                                    onClick={handleLogout}
                                    variant="outline-danger"
                                    size="sm"
                                >
                                    Log Out
                                </Button>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavBar;
