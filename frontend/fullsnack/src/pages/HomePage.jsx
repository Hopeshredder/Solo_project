import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import { getDailyCalories } from "../api";

// Grabs current date and returns YYYY-MM-DD in local time IOT fetch the current day from the backend
const formatYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const HomePage = () => {
    const { user } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dailyTotal, setDailyTotal] = useState(null);

    const today = useMemo(() => formatYMD(new Date()), []);

    useEffect(() => {
        // isMounted helps make sure the user is still on the page and if they aren't, then dont update the page
        let isMounted = true;
        const run = async () => {
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
                // Calls helper function located in Api.js IOT fetch daily calories from Django backend
                const total = await getDailyCalories(today);
                // Sets daily total to  what was returned or 0 if nothing has been logged today
                if (isMounted) setDailyTotal(total ?? 0);
            } catch (e) {
                if (isMounted) setError("Could not load today’s calories.");
            } finally {
                // Turns off loading effect
                if (isMounted) setLoading(false);
            }
        };
        run();
        return () => {
            isMounted = false;
        };
    }, [user, today]);

    return (
        <>
            {user ? (
                <>
                    {/* Header with centered icon + title */}
                    <div className="flex flex-col items-center mt-8 mb-6">
                        {/* Use the largest you have; Tailwind scales it responsively */}
                        <img
                            src="/fullsnack-logo.png"
                            srcSet="/fullsnack-logo.png 128w, /fullsnack-logo.png 256w"
                            sizes="(max-width: 640px) 96px, 128px"
                            alt="FullSnack logo: mint-green pancake stack"
                            className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl shadow-md mb-3 ring-4 ring-[#2bb673]/20"
                        />
                        <h2 className="text-3xl font-bold text-center">
                            {/* &rsquo; is a curly apostraphe in HTML speak */}
                            {user.first_name}’s Homepage
                        </h2>
                    </div>

                    <div className="max-w-2xl mx-auto px-2">
                        {/* Display this while loading */}
                        {loading && (
                            <div className="flex items-center gap-2 mb-3">
                                <Spinner animation="border" role="status" size="sm" />
                                {/* &hellip; is an ellipse (...) to be used for loading */}
                                <span>Loading today’s total&hellip;</span>
                            </div>
                        )}

                        {/* Display this if an error appears */}
                        {error && (
                            <Alert variant="danger" className="mb-3">
                                {error}
                            </Alert>
                        )}
                        
                        {/* Display this if no error and no loading and user is signed in */}
                        {!loading && !error && (
                            <div className="flex justify-center">
                                <Card className="shadow-sm rounded-2xl w-fit">
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
                </>
            ) : (
                // Display this if user is not signed in
                <div className="flex flex-col items-center mt-12">
                    <img
                        src="/fullsnack-logo.png"
                        srcSet="/fullsnack-logo.png 128w, /fullsnack-logo.png 256w"
                        sizes="(max-width: 640px) 96px, 128px"
                        alt="FullSnack logo: mint-green pancake stack"
                        className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl shadow-md mb-3 ring-4 ring-[#2bb673]/20"
                    />
                    <h1 className="text-3xl font-bold mb-2 text-center">HomePage</h1>
                    <h2 className="text-xl text-center">Please Sign Up or Sign In</h2>
                </div>
            )}
        </>
    );
};

export default HomePage;
