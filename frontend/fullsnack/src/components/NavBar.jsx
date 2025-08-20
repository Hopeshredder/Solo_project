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
        <Navbar expand="lg" className="bg-white border-b border-snack-100 shadow-snack">
            <Container className="flex flex-col items-center gap-1 py-2 max-w-7xl mx-auto w-full">
                {/* Username row */}
                {user?.first_name && (
                    <div className="text-center fw-bold py-1 text-snack-700">
                        User – {user.first_name}
                    </div>
                )}

                <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Centered nav links */}
                    <Nav className="mx-auto d-flex align-items-center gap-3">
                        {!user && (
                            <>
                                <Nav.Link
                                    as={Link}
                                    to=""
                                    className="fw-medium text-snack-700 hover:text-snack-600"
                                >
                                    Home
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/signup/"
                                    className="fw-medium text-snack-700 hover:text-snack-600"
                                >
                                    Sign Up
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/login/"
                                    className="fw-medium text-snack-700 hover:text-snack-600"
                                >
                                    Log In
                                </Nav.Link>
                            </>
                        )}
                        {user && (
                            <>
                                <Nav.Link
                                    as={Link}
                                    to=""
                                    className="fw-medium text-snack-700 hover:text-snack-600"
                                >
                                    Home
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/profile/"
                                    className="fw-medium text-snack-700 hover:text-snack-600"
                                >
                                    Profile
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/foodlog/"
                                    className="fw-medium text-snack-700 hover:text-snack-600"
                                >
                                    Food Log
                                </Nav.Link>
                                <Nav.Link
                                    as={Link}
                                    to="/dashboard/"
                                    className="fw-medium text-snack-700 hover:text-snack-600"
                                >
                                    Dashboard
                                </Nav.Link>
                                <Button
                                    onClick={handleLogout}
                                    variant="outline-primary"
                                    size="sm"
                                    className="rounded-pill"
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
