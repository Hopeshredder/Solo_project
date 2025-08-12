import Card from "react-bootstrap/Card";

const APP_UTM = "FullSnack";
const UNSPLASH_HOME = `https://unsplash.com/?utm_source=${encodeURIComponent(APP_UTM)}&utm_medium=referral`;

const PreviewCard = ({ data }) => {
  const { food_name, calories, protein, carbs, fat, image_url, credit } = data || {};
  const profileLink = credit?.profile || null;
  const photoLink = credit?.unsplash || null;

  return (
    <Card className="max-w-sm mx-auto">
      {image_url && (
        photoLink ? (
          <a href={photoLink} target="_blank" rel="noopener noreferrer">
            <Card.Img variant="top" src={image_url} alt={food_name || "Food Image"} />
          </a>
        ) : (
          <Card.Img variant="top" src={image_url} alt={food_name || "Food Image"} />
        )
      )}

      <Card.Body className="p-4">
        <Card.Title>{food_name}</Card.Title>

        {/* Use a div wrapper so inner lines can be block elements */}
        <Card.Text as="div" className="space-y-1">
          <div>Calories: {calories}</div>
          <div>Protein: {protein} g</div>
          <div>Carbs: {carbs} g</div>
          <div>Fat: {fat} g</div>
        </Card.Text>

        {/* Unsplash attribution */}
        {data?.image_url && (
            <div className="mt-3 text-xs text-muted">
                {data?.credit?.name && data?.credit?.profile ? (
                    <>
                        Photo by{" "}
                        <a
                            href={data.credit.profile}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {data.credit.name}
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

export default PreviewCard;
