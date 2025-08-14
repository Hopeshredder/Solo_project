import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import ErrorPage from './pages/ErrorPage';
import { userConfirmation } from './api';
import FoodLogPage from './pages/FoodLogPage';
import DashboardPage from './pages/DashboardPage';
import DayViewPage from './pages/DayViewPage';
import ProtectedRoute from './routes/ProtectedRoute';

const router = createBrowserRouter([
    {
        path: '/',
        // Preload/confirm user session, make user available to children
        loader: userConfirmation,
        element: <App />,
        errorElement: <ErrorPage />, // top-level error boundary
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: '/signup/',
                element: <SignUp />
            },
            {
                path: '/login/',
                element: <LogIn />
            },
            // Protected routes require an authenticated user
            {
                path: '/foodlog/',
                element: (
                    <ProtectedRoute>
                        <FoodLogPage />
                    </ProtectedRoute>
                )
            },
            {
                path: '/dashboard/',
                element: (
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                )
            },
            {
                path: '/days/:date/',
                element: (
                    <ProtectedRoute>
                        <DayViewPage />
                    </ProtectedRoute>
                )
            },
            // If unknown route is passed
            {
                path: '*',
                element: <ErrorPage />
            }
        ]
    }
]);

export default router;
