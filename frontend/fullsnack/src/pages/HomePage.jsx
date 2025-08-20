import { useEffect, useMemo, useState, useCallback } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { getDailyCalories } from "../api";

// Grabs current date and returns YYYY-MM-DD in *UTC* to match FoodLogPage IOT fetch the current day from the backend
const isoYMD = () => new Date().toISOString().split("T")[0];

const HomePage = () => {
    const { user } = useOutletContext();
    const location = useLocation(); // used to refetch when the user navigates back to Home

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dailyTotal, setDailyTotal] = useState(null);

    // Compute "today" once per mount to match FoodLogPage
    const today = useMemo(() => isoYMD(), []);

    // Centralized fetch function so both effects can use it
    const refetch = useCallback(async () => {
        // If no one is logged in, don't worry about the daily total
        if (!user) {
            setDailyTotal(null);
            setError("");
            return;
        }
        // Sets loading effect to activate
        setLoading(true);
        setError("");
        try {
            // Calls helper function located in api.js IOT fetch daily calories from Django backend
            const total = await getDailyCalories(today);
            // Sets daily total to what was returned or 0 if nothing has been logged today
            setDailyTotal(total ?? 0);
        } catch (e) {
            setError("Could not load today’s calories.");
        } finally {
            // Turns off loading effect
            setLoading(false);
        }
    }, [user, today]);

    // Initial load + when coming back to this route
    useEffect(() => {
        refetch();
    }, [refetch, location.key]);

    // Catches changes to the aggregate fired by api.js / FoodLogPage
    useEffect(() => {
        let timer = null;

        const runWithRetries = () => {
            // retry up to 3 times, 250ms apart
            let tries = 0;
            const attempt = () => {
                tries += 1;
                refetch();
                if (tries < 3) {
                    timer = setTimeout(attempt, 250);
                }
            };
            attempt();
        };

        const onChanged = () => {
            console.log('[HomePage] received foodlog:changed');
            // small debounce before starting retries
            clearTimeout(timer);
            timer = setTimeout(runWithRetries, 120);
        };

        window.addEventListener('foodlog:changed', onChanged);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('foodlog:changed', onChanged);
        };
    }, [refetch]);

    return (
        <>
            {user ? (
                <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
                    {/* Header with centered icon + title */}
                    <div className="flex flex-col items-center mb-6">
                        {/* Use the largest you have; Tailwind scales it responsively */}
                        <div className="text-xl font-semibold leading-none mb-3" style={{ color: "var(--snack-primary)" }}>
                            FullSnack
                        </div>
                        
                        <img
                            src="/fullsnack-logo.png"
                            srcSet="/fullsnack-logo.png 128w, /fullsnack-logo.png 256w"
                            sizes="(max-width: 640px) 96px, 128px"
                            alt="FullSnack logo: mint-green pancake stack"
                            className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl shadow-md mb-3 ring-4 ring-[#2bb673]/20"
                        />
                        <h2 className="text-3xl font-bold text-center">
                            {/* ’ is a curly apostrophe */}
                            {user.first_name}’s Homepage
                        </h2>
                    </div>

                    {/* Loading/Error centered as well */}
                    {loading && (
                        <div className="flex items-center gap-2 mb-4">
                            <Spinner animation="border" role="status" size="sm" />
                            <span>Loading today’s total…</span>
                        </div>
                    )}
                    {error && (
                        <Alert variant="danger" className="mb-4 text-center">
                            {error}
                        </Alert>
                    )}

                    {/* Daily total card */}
                    {!loading && !error && (
                        <div className="w-full max-w-sm">
                            <Card className="shadow-sm rounded-2xl w-full">
                                <Card.Body className="py-4 px-6 text-center">
                                    <Card.Title className="text-lg mb-2">Today’s Calories</Card.Title>
                                    <div className="text-3xl font-semibold">
                                        {dailyTotal ?? 0}
                                        <span className="text-base font-normal ms-2">kcal</span>
                                    </div>
                                    <div className="text-sm text-muted mt-1">Date: {today}</div>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </div>
            ) : (
                // Display this if user is not signed in
                <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
                    <div className="flex flex-col items-center mb-6">
                        <div className="text-xl font-semibold leading-none mb-3" style={{ color: "var(--snack-primary)" }}>
                            FullSnack
                        </div>

                        <img
                            src="/fullsnack-logo.png"
                            srcSet="/fullsnack-logo.png 128w, /fullsnack-logo.png 256w"
                            sizes="(max-width: 640px) 96px, 128px"
                            alt="FullSnack logo: mint-green pancake stack"
                            className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl shadow-md mb-3 ring-4 ring-[#2bb673]/20"
                        />
                        
                        <h1 className="text-3xl font-bold mb-2 text-center">Home Page</h1>
                        <h2 className="text-xl text-center">Please Sign Up or Sign In</h2>
                    </div>
                </div>
            )}
        </>
    );
};

export default HomePage;
