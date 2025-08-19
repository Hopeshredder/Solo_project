import { useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { putFoodLog } from "../api";

const APP_UTM = "FullSnack";
const UNSPLASH_HOME = `https://unsplash.com/?utm_source=${encodeURIComponent(APP_UTM)}&utm_medium=referral`;

// Casts given value to a number if possible
const toNumberOr = (val, fallback) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
};

const FoodLogCard = ({ log, onDelete, onUpdated, credit: creditProp }) => {
    const { id, food_name, calories, protein, carbs, fat, image_url } = log || {};

    // Credits refer first to backend-stored fields, then prop, then any 'log.credit' object
    const credit = {
        name: log?.image_credit_name || creditProp?.name || log?.credit?.name || null,
        profile: log?.image_credit_profile || creditProp?.profile || log?.credit?.profile || null,
        source: log?.image_credit_source || creditProp?.source || log?.credit?.source || "Unsplash"
    };

    // Sets states or displays error message
    const [show, setShow] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Grabs food info and changes the numerical fields to numbers
    const [formFoodName, setFormFoodName] = useState(food_name ?? "");
    const [formCalories, setFormCalories] = useState(
        Number.isFinite(calories) ? String(calories) : ""
    );
    const [formProtein, setFormProtein] = useState(
        Number.isFinite(protein) ? String(protein) : ""
    );
    const [formCarbs, setFormCarbs] = useState(
        Number.isFinite(carbs) ? String(carbs) : ""
    );
    const [formFat, setFormFat] = useState(
        Number.isFinite(fat) ? String(fat) : ""
    );

    // Accreditation info
    const [formCreditName, setFormCreditName] = useState(credit?.name ?? "");
    const [formCreditProfile, setFormCreditProfile] = useState(credit?.profile ?? "");
    const [formCreditSource, setFormCreditSource] = useState(credit?.source ?? "Unsplash");

    const open = () => {
        setError("");
        setShow(true);
    };
    const close = () => setShow(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            // Build full payload for PUT with only non-readonly fields
            const payload = {
                food_name: formFoodName,
                calories: toNumberOr(formCalories, calories ?? 0),
                protein: toNumberOr(formProtein, protein ?? 0),
                carbs: toNumberOr(formCarbs, carbs ?? 0),
                fat: toNumberOr(formFat, fat ?? 0)
            };

            const updated = await putFoodLog(id, payload);
            onUpdated?.(updated);
            close();
            // Refresh the page IOT show the new values on the cards
            window.location.reload();
        } catch (err) {
            setError("Could not save changes. Please check your inputs and try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="w-full h-full border rounded bg-white shadow-sm flex flex-col">
            {/* Image */}
            {image_url && (
                <Card.Img variant="top" src={image_url} alt={food_name || "Food Image"} />
            )}

            <Card.Body className="flex flex-col gap-2">
                {/* Card title */}
                <div className="flex items-start justify-between gap-3">
                    <Card.Title className="text-lg font-semibold">{food_name}</Card.Title>
                    <div className="flex gap-2">
                        <Button variant="outline-secondary" size="sm" onClick={open}>
                            Edit
                        </Button>
                        {onDelete && (
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => onDelete(id)}
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Card food info */}
                <Card.Text as="div" className="space-y-1">
                    <div>Calories: {calories}</div>
                    <div>Protein: {protein} g</div>
                    <div>Carbs: {carbs} g</div>
                    <div>Fat: {fat} g</div>
                </Card.Text>

                {/* Credit block required by Unsplash */}
                {image_url && (
                    <div className="mt-2 text-xs text-muted">
                        {credit?.name && credit?.profile ? (
                            <>
                                Photo by{" "}
                                <a
                                    href={credit.profile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {credit.name}
                                </a>{" "}
                                on{" "}
                                <a
                                    href={UNSPLASH_HOME}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Unsplash
                                </a>
                            </>
                        ) : (
                            <>
                                Image via{" "}
                                <a
                                    href={UNSPLASH_HOME}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Unsplash
                                </a>
                            </>
                        )}
                    </div>
                )}
            </Card.Body>

            {/* Edit Modal */}
            <Modal show={show} onHide={close} centered>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Food Log</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {error && (
                            <Alert variant="danger" className="mb-3">
                                {error}
                            </Alert>
                        )}

                        <Form.Group className="mb-3" controlId="food_name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={formFoodName}
                                onChange={(e) => setFormFoodName(e.target.value)}
                                placeholder="e.g., Chicken Salad"
                                required
                            />
                        </Form.Group>

                        <div className="grid grid-cols-2 gap-3">
                            <Form.Group className="mb-3" controlId="calories">
                                <Form.Label>Calories</Form.Label>
                                <Form.Control
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    step="1"
                                    value={formCalories}
                                    onChange={(e) => setFormCalories(e.target.value)}
                                    placeholder="e.g., 420"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="protein">
                                <Form.Label>Protein (g)</Form.Label>
                                <Form.Control
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    step="1"
                                    value={formProtein}
                                    onChange={(e) => setFormProtein(e.target.value)}
                                    placeholder="e.g., 30"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="carbs">
                                <Form.Label>Carbs (g)</Form.Label>
                                <Form.Control
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    step="1"
                                    value={formCarbs}
                                    onChange={(e) => setFormCarbs(e.target.value)}
                                    placeholder="e.g., 50"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="fat">
                                <Form.Label>Fat (g)</Form.Label>
                                <Form.Control
                                    type="number"
                                    inputMode="numeric"
                                    min="0"
                                    step="1"
                                    value={formFat}
                                    onChange={(e) => setFormFat(e.target.value)}
                                    placeholder="e.g., 12"
                                />
                            </Form.Group>
                        </div>

                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={close} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={saving}>
                            {saving ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" role="status" />
                                    Saving…
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Card>
    );
};

export default FoodLogCard;
