import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { getMyInfo, updateMyInfo } from "../api";

// Picks the error message to display
const pickFirstError = (err) => {
    // If there is no error, return this message
    if (!err) return "Update failed.";
    // If the error is a string, return it
    if (typeof err === "string") return err;
    // Looks for all errors associated with the following fields and returns the first error associated with them as a string
    const order = ["old_password", "new_password", "email", "non_field_errors", "detail"];
    for (const k of order) {
        const v = err[k];
        if (Array.isArray(v) && v.length) return v[0];
        if (typeof v === "string") return v;
    }
    // If none of those are errors, return the first key as the error
    const firstKey = Object.keys(err)[0];
    const firstVal = err[firstKey];
    return Array.isArray(firstVal) ? firstVal[0] : String(firstVal ?? "Update failed.");
};

const ProfilePage = () => {
    // Updates global user after save in the outlet context
    const outlet = useOutletContext?.() || {};
    const userFromContext = outlet.user;
    const setUser = outlet.setUser;

    // Handles loading graphics, messages for alerts, and the saving state for the Put operation
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Editable fields
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    // Optional password change (will only be sent if newPassword is provided)
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNew, setConfirmNew] = useState("");

    // Mounts current user info in case the user changes pages
    // Then grabs the current user's info
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError("");
            setSuccess("");
            try {
                const me = await getMyInfo();
                if (!mounted) return;
                setEmail(me?.email || "");
                setFirstName(me?.first_name || "");
                setLastName(me?.last_name || "");
            } catch (e) {
                if (!mounted) return;
                setError("Could not load profile.");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        // Client-side check for password confirmation
        if (newPassword && newPassword !== confirmNew) {
            setSaving(false);
            setError("New password and confirmation do not match.");
            return;
        }

        // Loads the new information the user wants to set or a blank if nothing is entered
        try {
            const payload = {
                email: email || undefined,
                first_name: firstName || "",
                last_name: lastName || "",
            };

            // Only includes password fields if attempting to change password
            if (newPassword) {
                payload.old_password = oldPassword || "";
                payload.new_password = newPassword;
            }

            const updated = await updateMyInfo(payload);

            // Updates local state with the new info if it exists
            setSuccess("Profile updated successfully.");
            if (updated?.email) setEmail(updated.email);
            if (updated?.first_name !== undefined) setFirstName(updated.first_name);
            if (updated?.last_name !== undefined) setLastName(updated.last_name);

            // Clears password fields on success
            setOldPassword("");
            setNewPassword("");
            setConfirmNew("");

            // Makes sure the setUser function was passed correctly
            if (typeof setUser === "function") {
                // Normalizes the returns of getting and putting a user
                const normalized = updated?.email ? updated : (updated?.user ?? updated);
                setUser(normalized);
            }
        }  catch (e) {
            const apiErr = e?.response?.data || e?.message;
            setError(pickFirstError(apiErr));
        } finally {
            // Finish saving (using put function)
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-3 mt-8">
            <Card className="shadow-sm rounded-2xl">
                <Card.Body className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>

                    {/* Display this when loading */}
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <Spinner size="sm" animation="border" role="status" />
                            <span>Loading…</span>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            {/* Shows error if is one */}
                            {error && (
                                <Alert variant="danger" className="mb-3">
                                    {error}
                                </Alert>
                            )}
                            {/* Shows success message if is one */}
                            {success && (
                                <Alert variant="success" className="mb-3">
                                    {success}
                                </Alert>
                            )}
                            {/* Bulk of form, where changes happen */}
                            <Form.Group className="mb-3" controlId="first_name">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="First name"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="last_name">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Last name"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Your email is your login username.
                                </Form.Text>
                            </Form.Group>

                            <hr className="my-4" />

                            <div className="mb-2 text-sm text-muted">
                                Change password (optional)
                            </div>

                            <Form.Group className="mb-3" controlId="old_password">
                                <Form.Label>Current Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    autoComplete="current-password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="new_password">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="confirm_new_password">
                                <Form.Label>Confirm New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    autoComplete="new-password"
                                    value={confirmNew}
                                    onChange={(e) => setConfirmNew(e.target.value)}
                                    placeholder="Re-enter new password"
                                />
                            </Form.Group>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={saving}
                                >
                                    {/* Show loading spinner while info is saved to DB/processing */}
                                    {saving ? (
                                        <>
                                            <Spinner
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                className="me-2"
                                            />
                                            Saving…
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default ProfilePage;
