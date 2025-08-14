import React, { useState } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { api } from '../utilities';
import { Link, UNSAFE_getTurboStreamSingleFetchDataStrategy } from 'react-router-dom';

// Grabs current date of the entry and changes it to DD MONTH format for start of weeks
function formatWeekStart(startDateStr) {
    const d = new Date(startDateStr + 'T00:00:00');
    const day = String(d.getDate()).padStart(2, '0');
    const month = new Intl.DateTimeFormat('en', { month: 'long' }).format(d);
    return `${day} ${month}`;
}

// Changes the Day to be the English day of the week (Monday, Tuesday, etc)
function formatWeekdayLabel(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('en', { weekday: 'long' }).format(d);
}

export default function WeekList({ weeks }) {
    // Toggle for if a week accordion is open or not
    const [openWeek, setOpenWeek] = useState(null);
    // Keeps track of the days to be displayed
    const [daysByWeek, setDaysByWeek] = useState({});
    // Keeps track of which week is being loaded from the backend so a loader can be set in that specific panel
    const [loadingWeek, setLoadingWeek] = useState(null);

    // Toggles between closed and open accordion
    const toggleWeek = async (startDate) => {
        if (openWeek === startDate) {
            setOpenWeek(null);
            return;
        }
        setOpenWeek(startDate);

        // Fetch days for this week if not already fetched
        if (!daysByWeek[startDate]) {
            try {
                // Loading spinner on
                setLoadingWeek(startDate);

                // Grabs all the days of the specified week
                const res = await api.get('/dates/days/', { params: { week_start: startDate } });
                setDaysByWeek((prev) => ({ ...prev, [startDate]: res.data || [] }));
            } catch (err) {
                console.error('Failed to fetch days for week', startDate, err);
                setDaysByWeek((prev) => ({ ...prev, [startDate]: [] }));
            } finally {
                // Close out loading spinner
                setLoadingWeek(null);
            }
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {weeks.map((w) => {
                const isOpen = openWeek === w.start_date;
                const days = daysByWeek[w.start_date] || [];

                return (
                    <Card key={w.id} className="shadow rounded-2xl">
                        <Card.Body className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                {/* Text on the week accordion */}
                                <div className="flex flex-col">
                                    <span className="font-semibold">
                                        Week of {formatWeekStart(w.start_date)}
                                    </span>
                                    <span className="text-sm text-gray-700">
                                        {w.weekly_calorie_total} kcal
                                    </span>
                                </div>
                                {/* Button to collapse/expand the week accordion */}
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => toggleWeek(w.start_date)}
                                >
                                    {isOpen ? 'Hide days' : 'Show days'}
                                </Button>
                            </div>

                            {isOpen && (
                                <div className="border-t pt-2">
                                    {/* Loading spinner */}
                                    {loadingWeek === w.start_date && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Spinner animation="border" size="sm" /> Loading days...
                                        </div>
                                    )}

                                    {/* Days display */}
                                    {loadingWeek !== w.start_date && (
                                        <>
                                            {/* If no days in storage, say that */}
                                            {days.length === 0 ? (
                                                <div className="text-gray-500 text-sm">
                                                    No days found for this week.
                                                </div>
                                            ) : (
                                                <ul className="divide-y">
                                                    {/* For each day, print out the day of the week and daily calorie total */}
                                                    {days.map((d) => (
                                                        <li key={d.id} className="py-2 flex items-center justify-between">
                                                            <span className="font-medium">
                                                                {formatWeekdayLabel(d.date)}
                                                            </span>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-gray-700">
                                                                    {d.daily_calorie_total} kcal
                                                                </span>
                                                                {/* Link to a page that shows that day's details */}
                                                                <Link
                                                                    className="text-primary hover:underline"
                                                                    to={`/days/${d.date}/`}
                                                                    title={`Open log for ${d.date}`}
                                                                >
                                                                    View Day
                                                                </Link>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                );
            })}

            {/* If user has no weeks in DB, display this */}
            {weeks.length === 0 && (
                <div className="text-gray-500">No week summaries yet.</div>
            )}
        </div>
    );
}
