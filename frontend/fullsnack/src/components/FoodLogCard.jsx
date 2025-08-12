import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const APP_UTM = "FullSnack";
const UNSPLASH_HOME = `https://unsplash.com/?utm_source=${encodeURIComponent(APP_UTM)}&utm_medium=referral`;

const FoodLogCard = ({ log, onDelete, credit: creditProp }) => {
  const { id, food_name, calories, protein, carbs, fat, image_url } = log || {};
  const credit = creditProp || log?.credit || null; // prop wins, fallback to log field if ever added

  const profileLink = credit?.profile || null;

  return (
    <Card className="w-full">
      {image_url && (
        <Card.Img variant="top" src={image_url} alt={food_name || "Food Image"} />
      )}

      <Card.Body>
        <Card.Title className="flex items-center justify-between">
          <span>{food_name}</span>
          {onDelete && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete(id)}
            >
              Delete
            </Button>
          )}
        </Card.Title>

        <Card.Text as="div" className="space-y-1">
          <div>Calories: {calories}</div>
          <div>Protein: {protein} g</div>
          <div>Carbs: {carbs} g</div>
          <div>Fat: {fat} g</div>
        </Card.Text>

        {/* Unsplash attribution */}
        {log?.image_url && (
            <div className="mt-3 text-xs text-muted">
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
                        on Unsplash
                    </>
                ) : (
                    <>Image: Unsplash</>
                )}
            </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FoodLogCard;
