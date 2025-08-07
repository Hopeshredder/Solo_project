import React from 'react';
import { Card } from 'react-bootstrap';

const PreviewCard = ({ data }) => {
    if (!data) return null;

    // Splits up the given dictionary
    const { food_name, calories, protein, carbs, fat, image_url } = data;

    return (
        <Card className="max-w-sm mx-auto mt-4 shadow-lg rounded-2xl border border-gray-200">
            {/* If there is an image URL, display the image */}
            {image_url && <Card.Img variant="top" src={image_url} alt={food_name} className="rounded-t-2xl" />}
            <Card.Body className="p-4">
                <Card.Title className="text-xl font-semibold">{food_name}</Card.Title>
                <Card.Text className="space-y-1">
                    <p>Calories: {calories}</p>
                    <p>Protein: {protein}g</p>
                    <p>Carbs: {carbs}g</p>
                    <p>Fat: {fat}g</p>
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default PreviewCard;
