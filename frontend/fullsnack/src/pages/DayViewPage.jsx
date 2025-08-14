import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utilities';
import FoodLogCard from '../components/FoodLogCard';

const DayViewPage = () => {
    // Grabs date in YYYY-DD-MM format below
    const { date } = useParams();
    // State with a list of all of the foodlogs of a given day
    const [logs, setLogs] = useState([]);
    // State for loading spinner, starts as true
    const [loading, setLoading] = useState(true);

    // Converts the date string into a readable title: "Monday, 2025-08-06"
    const dayTitle = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    // Tries to get the logs for a day from the backend
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // Grabs food logs based on the date given
                const res = await api.get('/foods/', { params: { day: date } });
                setLogs(res.data);
            } catch (err) {
                console.error('Failed to fetch logs for day:', err);
            } finally {
                // Turns off loading spinner
                setLoading(false);
            }
        };

        fetchLogs();
    }, [date]);

    return (
        <div className="px-4 py-6 max-w-7xl mx-auto">
            {loading ? (
                <p className="text-center text-gray-600">Loading...</p>
            ) : logs.length > 0 ? (
                <ul className="grid [grid-template-columns:repeat(auto-fill,minmax(18rem,1fr))] gap-4 justify-items-center">
                    {logs.map((log) => (
                        <li key={log.id} className="w-full max-w-[20rem]">
                            <FoodLogCard log={log} onDelete={() => {}} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500">No entries for this day.</p>
            )}
        </div>
    );
};

export default DayViewPage;
