import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const APP_UTM = "FullSnack";
const UNSPLASH_HOME = `https://unsplash.com/?utm_source=${encodeURIComponent(APP_UTM)}&utm_medium=referral`;

const FoodLogCard = ({ log, onDelete, credit: creditProp }) => {
    const { id, food_name, calories, protein, carbs, fat, image_url } = log || {};

    // Credits refer first to backend-stored fields, then prop, then any 'log.credit' object
    const credit = {
        name: log?.image_credit_name || creditProp?.name || log?.credit?.name || null,
        profile: log?.image_credit_profile || creditProp?.profile || log?.credit?.profile || null,
        source: log?.image_credit_source || creditProp?.source || log?.credit?.source || "Unsplash"
    };

    return (
        <Card className="w-full h-full border rounded bg-white shadow-sm flex flex-col">
            {/* Image */}
            {image_url && (
                <Card.Img variant="top" src={image_url} alt={food_name || "Food Image"} />
            )}

            <Card.Body className="flex flex-col gap-2">
                {/* Card title */}
                <Card.Title className="text-lg font-semibold">{food_name}</Card.Title>
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
                        {/* If all credit info exists, use it. Otherwise, do a default credit block */}
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

            {/* Footer with Delete button */}
            {onDelete && (
                <Card.Footer className="bg-transparent border-0 pt-0">
                    <div className="flex justify-end">
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => onDelete(id)}
                        >
                            Delete
                        </Button>
                    </div>
                </Card.Footer>
            )}
        </Card>
    );
};

export default FoodLogCard;
