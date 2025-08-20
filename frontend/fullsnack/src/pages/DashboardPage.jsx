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
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl snack-heading mb-2 text-center">Dashboard</h1>
            <p className="text-center text-muted mb-6">Your weekly and daily calorie summaries</p>
            <hr className="snack-divider" />

            {/* This was from an earlier version of the dashboard, before implimentation of the accordion week format */}
            {/* <Card className="snack-card rounded-2xl mb-4">
                <Card.Body>
                    <Card.Title className="text-lg snack-heading mb-2">Recent Days</Card.Title>
                    {loading && days.length === 0 ? (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Spinner animation="border" size="sm" /> Loading...
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {days.map((d) => (
                                <li key={d.id} className="py-2 flex items-center justify-between">
                                    <span className="font-medium">{d.date}</span>
                                    <span className="text-snack-700">{d.daily_calorie_total} kcal</span>
                                </li>
                            ))}
                            {days.length === 0 && (
                                <li className="py-2 text-gray-500">No day summaries yet.</li>
                            )}
                        </ul>
                    )}
                </Card.Body>
            </Card> */}

            <h3 className="text-xl snack-heading mb-3 text-center">Recent Weeks</h3>
            {loading && weeks.length === 0 ? (
                <div className="flex items-center justify-center gap-2 text-snack-700">
                    <Spinner animation="border" size="sm" /> Loading...
                </div>
            ) : (
                <div className="snack-section">
                    <WeekList weeks={weeks} />
                </div>
            )}
        </div>
    );
}
