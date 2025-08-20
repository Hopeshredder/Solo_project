import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { registerUser } from "../api";
import { useOutletContext, useNavigate } from "react-router-dom";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [lName, setLName] = useState("");
    const [fName, setFName] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const { setUser } = useOutletContext();
    const navigate = useNavigate();

    // Client-side checks (NO email format check)
    const validate = () => {
        const fe = {};
        if ((fName || "").trim().length < 2) fe.first_name = "First name must be at least 2 characters.";
        if ((lName || "").trim().length < 2) fe.last_name = "Last name must be at least 2 characters.";
        if ((password || "").length < 8) fe.password = "Password must be at least 8 characters.";
        return fe;
    };

    // Normalize DRF errors -> per-field + top-level
    const absorbApiErrors = (apiErr) => {
        const raw = apiErr && typeof apiErr === "object" ? apiErr : { detail: String(apiErr || "Signup failed.") };
        const fe = {};
        // include 'email' so server errors (e.g., duplicate) show under the field
        for (const k of ["email", "password", "first_name", "last_name"]) {
            if (raw[k]) fe[k] = Array.isArray(raw[k]) ? raw[k][0] : String(raw[k]);
        }
        const top = raw.non_field_errors || raw.detail || "";
        return { fe, top: Array.isArray(top) ? top[0] : String(top) };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setFieldErrors({});

        const fe = validate();
        if (Object.keys(fe).length) {
            setFieldErrors(fe);
            setSaving(false);
            return;
        }

        try {
            const user = await registerUser(email, password, fName, lName);
            if (user) {
                setUser(user);
                navigate("/");
            }
        } catch (e2) {
            const apiErr = e2?.response?.data || e2?.message;
            const { fe: serverFe, top } = absorbApiErrors(apiErr);
            setFieldErrors(serverFe);
            if (top) setError(top);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="bg-white snack-card rounded-2xl border border-snack-100 shadow-snack w-full max-w-md p-6">
                <h1 className="text-3xl snack-heading mb-4 text-center">Sign Up</h1>

                {/* Top-level error (non_field_errors / detail) */}
                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="text"                 // ← no HTML5 email validation
                            placeholder="Enter email"
                            autoComplete="email"
                            // required removed to avoid browser-level validation for email
                            isInvalid={!!fieldErrors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.email}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            We’ll never share your email with anyone else.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password"
                            placeholder="Password"
                            autoComplete="new-password"
                            required
                            isInvalid={!!fieldErrors.password}
                        />
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.password}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Minimum 8 characters.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formFirstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            onChange={(e) => setFName(e.target.value)}
                            value={fName}
                            type="text"
                            placeholder="First Name"
                            autoComplete="given-name"
                            required
                            isInvalid={!!fieldErrors.first_name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.first_name}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="formLastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            onChange={(e) => setLName(e.target.value)}
                            value={lName}
                            type="text"
                            placeholder="Last Name"
                            autoComplete="family-name"
                            required
                            isInvalid={!!fieldErrors.last_name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {fieldErrors.last_name}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-full rounded-pill" disabled={saving}>
                        {saving ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Creating…
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>

                    <div className="text-center mt-3 text-sm">
                        <span className="text-muted">Already have an account?</span>{" "}
                        <a href="/login/" className="text-snack-700 hover:text-snack-600">
                            Log in
                        </a>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default SignUp;
