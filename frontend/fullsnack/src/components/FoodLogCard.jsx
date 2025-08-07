import React from 'react';
import { Card, Button } from 'react-bootstrap';

const FoodLogCard = ({ log, onDelete }) => {
    return (
        <Card className="border p-3 rounded bg-white shadow-sm flex items-center justify-between">
            <div>
                <div className="font-medium">{log.food_name}</div>
                <div className="text-sm text-gray-600">{log.calories} kcal · P {log.protein}g · C {log.carbs}g · F {log.fat}g</div>
            </div>
            <Button variant="outline-danger" size="sm" onClick={() => onDelete(log.id)}>
                Delete
            </Button>
        </Card>
    );
};

export default FoodLogCard;