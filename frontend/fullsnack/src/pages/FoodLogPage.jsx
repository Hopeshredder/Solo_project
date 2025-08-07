import React, { useEffect, useState } from 'react';
import { api } from '../utilities';
import PreviewCard from '../components/PreviewCard';
import FoodLogCard from '../components/FoodLogCard';
import { Button, Form, Spinner } from 'react-bootstrap';

const FoodLogPage = () => {
    // Keeps track of user input in the search bar
    const [query, setQuery] = useState('');
    // Keeps track of food data for the preview card before it gets confirmed
    const [previewData, setPreviewData] = useState(null);
    // Keeps track of current food logs for today
    const [foodLogs, setFoodLogs] = useState([]);
    // Keeps track of what day it is
    const [today, setToday] = useState(new Date().toISOString().split('T')[0]);

    // Gets a list of current food logs on page startup
    useEffect(() => {
        fetchLogs();
    }, []);

    // Calls backend to get a list of foods that have been logged
    const fetchLogs = async () => {
        const res = await api.get(`/foodlogs/?day=${today}`);
        setFoodLogs(res.data);
    };

    // Calls backend to search for the inputted food name
    const searchNutrition = async (e) => {
        e.preventDefault();
        // If the search box is empty, leave
        if (!query.trim()) return;
        try {
            // Start loading spinner
            setLoading(true);

            // Calls backend to search the nutrition API and gets a response
            const response = await api.get(`/foods/nutrition/?query=${encodeURIComponent(query)}`);
            const item = response.data.item;

            // If a response was gotten, get all of the data
            if (item) {
                setPreviewData({
                    food_name: item.name,
                    calories: Math.round(item.calories),
                    protein: Math.round(item.protein_g),
                    carbs: Math.round(item.carbohydrates_total_g ?? 0),
                    fat: Math.round(item.fat_total_g),
                    image_url: `https://source.unsplash.com/featured/?${encodeURIComponent(item.name)}`
                });
            } else {
                // If no response was gotten, dont do preview
                setPreviewData(null);
            }
        } catch (err) {
            console.error('Failed to fetch nutrition info', err);
        } finally {
            // End loading spinner before going back to main menu
            setLoading(false);
        }
    };

    // Adds currently loaded preview data to the backend API, and resets the page
    const addToLog = async () => {
        if (!previewData) return;
        try {
            await api.post('/foodlogs/', previewData);
            setPreviewData(null);
            setQuery('');
            fetchLogs();
        } catch (err) {
            console.error('Failed to add food log', err);
        }
    };

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Food Log</h1>
            {/* Form for searching the API for a food */}
            <Form onSubmit={searchNutrition} className="mb-4">
                <Form.Group className="flex gap-2">
                    <Form.Control
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search food..."
                    />
                    <Button type="submit">Search</Button>
                </Form.Group>
            </Form>

            {/* Displays a card with info of a food searched and allows user to confirm for it to be added to the log for today */}
            {previewData && (
                <>
                    <PreviewCard data={previewData} />
                    <div className="text-center mt-2">
                        <Button onClick={addToLog}>Add to Log</Button>
                    </div>
                </>
            )}
            
            {/* Displays all the foods currently in the log for the given day, shows spinner while loading and a message */}
            <h2 className="text-xl font-semibold mt-6 mb-2">Today's Entries</h2>
            {loading && foodLogs.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-600"><Spinner animation="border" size="sm" /> Loading...</div>
            ) : (
                <ul className="space-y-2">
                    {foodLogs.map((log) => (
                        <li key={log.id}>
                            <FoodLogCard log={log} onDelete={deleteLog} />
                        </li>
                    ))}
                    {/* Shows message if no logs are found in the DB */}
                    {foodLogs.length === 0 && (
                        <li className="text-gray-500">No entries yet. Search above to add your first log.</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default FoodLogPage;