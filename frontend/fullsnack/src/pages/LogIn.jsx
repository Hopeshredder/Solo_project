import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useOutletContext } from "react-router-dom";
import { loginUser } from "../api";
import { useNavigate } from "react-router-dom";

const LogIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useOutletContext();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white snack-card rounded-2xl border border-snack-100 shadow-snack w-full max-w-md p-6">
            <h1 className="text-3xl snack-heading mb-4 text-center">Log In</h1>

            <Form
                // Tries to log a user in and if successful, redirect to the home page
                onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                        const loggedInUser = await loginUser(email, password);
                        if (loggedInUser) {
                            setUser(loggedInUser);
                            navigate("/");
                        }
                    } catch (err) {
                        console.error("Login failed:", err);
                    }
                }}
            >
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        type="email"
                        placeholder="Enter email"
                        autoComplete="email"
                        required
                    />
                    <Form.Text className="text-muted">
                        We will never share your email with anyone else.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-full rounded-pill">
                    Submit
                </Button>

                <div className="text-center mt-3 text-sm">
                    <span className="text-muted">Don’t have an account?</span>{" "}
                    <a href="/signup/" className="text-snack-700 hover:text-snack-600">
                        Sign up
                    </a>
                </div>
            </Form>
        </div>
    </div>
  );
};

export default LogIn;