import React, { useEffect, useState } from 'react';
import { api } from '../utilities';
import { Card, Spinner } from 'react-bootstrap';
import WeekList from '../components/WeekList';

export default function DashboardPage() {
    const [days, setDays] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [loading, setLoading] = useState(false);

    // On page startup, fetch the saved day and week objects from the backend and store them in usestate
    const fetchSummaries = async () => {
        try {
            // Sets loading  spinner to spin
            setLoading(true);
            // Promise.all() fetches both lists from the backend at the same time, dRes=days response, wRes = weeks response
            const [dRes, wRes] = await Promise.all([
                api.get('/dates/days/'),
                api.get('/dates/weeks/')
            ]);
            // Sets the days and weeks to what the user currently has on file in the usestate
            setDays(dRes.data || []);
            setWeeks(wRes.data || []);
        } catch (err) {
            console.error('Failed to fetch summaries', err);
        } finally {
            // Stops loading spinner
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummaries();

        // Listen for cross-page updates such as from FoodLogPage add/delete
        const onUpdated = () => fetchSummaries();
        window.addEventListener('foodlog:updated', onUpdated);
        return () => window.removeEventListener('foodlog:updated', onUpdated);
    }, []);

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">Dashboard</h1>

            {/* This was from an earlier version of the dashboard, before implimentation of the accordion week format */}
            {/* <Card className="shadow rounded-2xl mb-4">
                <Card.Body>
                    <Card.Title className="text-lg font-semibold mb-2">Recent Days</Card.Title>
                    {loading && days.length === 0 ? (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Spinner animation="border" size="sm" /> Loading...
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {days.map((d) => (
                                <li key={d.id} className="py-2 flex items-center justify-between">
                                    <span className="font-medium">{d.date}</span>
                                    <span className="text-gray-700">{d.daily_calorie_total} kcal</span>
                                </li>
                            ))}
                            {days.length === 0 && (
                                <li className="py-2 text-gray-500">No day summaries yet.</li>
                            )}
                        </ul>
                    )}
                </Card.Body>
            </Card> */}

            <h3 className="text-xl font-semibold mb-2 text-center">Recent Weeks</h3>
            {loading && weeks.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-600">
                    <Spinner animation="border" size="sm" /> Loading...
                </div>
            ) : (
                <WeekList weeks={weeks} />
            )}
        </div>
    );
}
