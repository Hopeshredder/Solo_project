import React, { useEffect, useState } from 'react';
import { api } from '../utilities';
import PreviewCard from '../components/PreviewCard';
import FoodLogCard from '../components/FoodLogCard';
import { setFoodLogImage, previewFoodImages, createFoodLog } from '../api';
import { Button, Form, Spinner } from 'react-bootstrap';

const FoodLogPage = () => {
    // Keeps track of user input in the search bar
    const [query, setQuery] = useState('');
    // Keeps track of food data for the preview card before it gets confirmed
    const [previewData, setPreviewData] = useState(null);
    // Keeps track of current food logs for today
    const [foodLogs, setFoodLogs] = useState([]);
    // Keeps track of what day it is
    const [today] = useState(new Date().toISOString().split('T')[0]);
    // Loading flags for searching and adding logs
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    // Used for crediting images as pre Unsplash TOS
    const [creditsById, setCreditsById] = useState({});

    // Gets a list of current food logs on page startup
    useEffect(() => {
        fetchLogs();
    }, []);

    // Calls backend to get a list of foods that have been logged and uses a spinner while loading
    const fetchLogs = async () => {
        try {
            setLoading(true);
            // use params for clarity
            const res = await api.get(`/foods/`, { params: { day: today }});
            setFoodLogs(res.data);
        } catch (e) {
            console.error('Failed to fetch logs', e);
        } finally {
            setLoading(false);
        }
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
            const response = await api.get(`/foods/nutrition/`, { params: { query }});
            const item = response.data.item;

            // If a response was gotten, get all of the data
            if (item) {
                // Get first Unsplash image from backend preview endpoint
                let first = null;
                try {
                    const images = await previewFoodImages(item.name);
                    first = images?.[0] || null;
                } catch (imgErr) {
                    console.warn('Image preview failed:', imgErr);
                }

                setPreviewData({
                    food_name: item.name,
                    calories: Math.round(item.calories),
                    protein: Math.round(item.protein_g),
                    carbs: Math.round(item.carbohydrates_total_g ?? 0),
                    fat: Math.round(item.fat_total_g),
                    image_url: first?.full || first?.thumb || '',
                    credit: first?.credit || null,
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
            setAdding(true);

            // Create the FoodLog using helper function in api.js 
            const created = await createFoodLog({
                food_name: previewData.food_name,
                calories: previewData.calories,
                protein: previewData.protein,
                carbs: previewData.carbs,
                fat: previewData.fat,
            });

            // Update its image using the backend Unsplash proxy and add its credits to the usestate
            const { foodlog: updated, credit } = await setFoodLogImage(created.id, previewData.food_name);

            // Adds most recent credits to the rest of the list of credits
            if (credit) {
                setCreditsById(prev => ({ ...prev, [updated.id]: credit }));
            }

            // Reset + refresh
            setPreviewData(null);
            setQuery("");
            fetchLogs();
        } catch (err) {
            console.error("Failed to add food log", err);
        } finally {
            setAdding(false);
        }
    };

    // Deletes a log entry from the backend and updates the frontend list
    const deleteLog = async (id) => {
        try {
            await api.delete(`/foods/${id}/`);
            setFoodLogs((prev) => prev.filter((f) => f.id !== id));
        } catch (e) {
            console.error('Failed to delete log', e);
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
                    <Button type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : "Search"}
                    </Button>
                </Form.Group>
            </Form>

            {/* Displays a card with info of a food searched and allows user to confirm for it to be added to the log for today */}
            {previewData && (
                <>
                    <PreviewCard data={previewData} />
                    <div className="text-center mt-2">
                        <Button onClick={addToLog} disabled={adding}>
                            {adding ? <Spinner animation="border" size="sm" /> : "Add to Log"}
                        </Button>
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
                            {/* pass credit down so FoodLogCard can show attribution */}
                            <FoodLogCard log={log} onDelete={deleteLog} credit={creditsById[log.id]} />
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
