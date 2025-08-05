import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { registerUser } from "../api";
import { useOutletContext, useNavigate } from "react-router-dom";

/**
 *
 * - Make signup form
 * - Put form data in react component state
 * - Make api call to sign up user
 * - Save auth token from http response so we can use it
 */

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [lName, setLName] = useState("");
    const [fName, setFName] = useState("");
    const { setUser } = useOutletContext();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newUser = await registerUser(email, password, fName, lName);
            if (newUser) {
                setUser(newUser);
                navigate("/");
            }
        } catch (err) {
            console.error("Sign-up failed:", err);
        }
    };

    return (
        <>
        <h1>SignUp</h1>
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Enter email"
            />
            <Form.Text className="text-muted">
                We'll never share your email with anyone else.
            </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Password"
            />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
                onChange={(e) => setFName(e.target.value)}
                value={fName}
                type="first_name"
                placeholder="First Name"
            />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
                onChange={(e) => setLName(e.target.value)}
                value={lName}
                type="last_name"
                placeholder="Last Name"
            />
            </Form.Group>
            <Button variant="primary" type="submit">
            Submit
            </Button>
        </Form>
        </>
    );
    };

    export default SignUp;