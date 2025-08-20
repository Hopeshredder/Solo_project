import React, { useEffect, useState, useCallback } from 'react';
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
    const fetchLogs = useCallback(async () => {
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
    }, [date]);

    // Fetch logs on startup
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Refetch today's logs whenever a food log changes anywhere
    useEffect(() => {
        const onChanged = () => fetchLogs();
        window.addEventListener('foodlog:changed', onChanged);
        return () => window.removeEventListener('foodlog:changed', onChanged);
    }, [fetchLogs]);

    const deleteLog = async (id) => {
        try {
            // Delete from backend
            await api.delete(`/foods/${id}/`);

            // Optimistically remove from the list
            setLogs((prev) => prev.filter((f) => f.id !== id));

            // Let other screens (Home/Dashboard) refresh their aggregates
            window.dispatchEvent(new Event('foodlog:changed'));
            window.dispatchEvent(new Event('foodlog:updated')); // backward-compat if something still listens to this
        } catch (e) {
            console.error('Failed to delete log', e);
        }
    };

    
    return (
        <div className="px-4 py-8 max-w-6xl mx-auto">
            {loading ? (
                <div className="text-center text-snack-700">
                    <span className="inline-block animate-pulse">Loading…</span>
                </div>
            ) : logs.length > 0 ? (
                <ul className="grid [grid-template-columns:repeat(auto-fill,minmax(18rem,1fr))] gap-5 justify-items-center">
                    {logs.map((log) => (
                        <li key={log.id} className="w-full max-w-[20rem]">
                            <FoodLogCard log={log} onDelete={deleteLog} />
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="max-w-md mx-auto self-center">
                    <div className="bg-white snack-card rounded-2xl border border-snack-100 shadow-snack p-6 text-center">
                        <p className="text-snack-700">No entries for this day.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DayViewPage;
