import Card from "react-bootstrap/Card";

const APP_UTM = "FullSnack";
const UNSPLASH_HOME = `https://unsplash.com/?utm_source=${encodeURIComponent(APP_UTM)}&utm_medium=referral`;

const PreviewCard = ({ data }) => {
  const { food_name, calories, protein, carbs, fat, image_url, credit } = data || {};
  const profileLink = credit?.profile || null;
  const photoLink = credit?.unsplash || null;

  return (
    <Card className="w-full max-w-[22rem] mx-auto mt-4 bg-white snack-card rounded-2xl border border-snack-100 shadow-snack overflow-hidden">
        {image_url && (
            photoLink ? (
                <a href={photoLink} target="_blank" rel="noopener noreferrer">
                    <Card.Img
                        variant="top"
                        src={image_url}
                        alt={food_name || "Food Image"}
                        className="rounded-t-2xl object-cover max-h-48"
                    />
                </a>
            ) : (
                <Card.Img
                    variant="top"
                    src={image_url}
                    alt={food_name || "Food Image"}
                    className="rounded-t-2xl object-cover max-h-48"
                />
            )
        )}

        <Card.Body className="p-4">
            <Card.Title className="text-lg font-semibold snack-heading mb-2">
                {food_name}
            </Card.Title>

            {/* Use a div wrapper so inner lines can be block elements */}
            <Card.Text as="div" className="mt-1 grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded-xl border bg-white text-center">
                    <div className="text-muted text-xs">Calories</div>
                    <div className="font-semibold">
                        {calories}
                        <span className="text-xs ms-1">kcal</span>
                    </div>
                </div>
                <div className="p-2 rounded-xl border bg-white text-center">
                    <div className="text-muted text-xs">Protein</div>
                    <div className="font-semibold">
                        {protein}
                        <span className="text-xs ms-1">g</span>
                    </div>
                </div>
                <div className="p-2 rounded-xl border bg-white text-center">
                    <div className="text-muted text-xs">Carbs</div>
                    <div className="font-semibold">
                        {carbs}
                        <span className="text-xs ms-1">g</span>
                    </div>
                </div>
                <div className="p-2 rounded-xl border bg-white text-center">
                    <div className="text-muted text-xs">Fat</div>
                    <div className="font-semibold">
                        {fat}
                        <span className="text-xs ms-1">g</span>
                    </div>
                </div>
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
                                className="text-decoration-none"
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
