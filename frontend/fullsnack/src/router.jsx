import {createBrowserRouter} from 'react-router-dom'
import App from './App'
import HomePage from './pages/HomePage'
import LogIn from './pages/LogIn'
import SignUp from './pages/SignUp'
import ErrorPage from './pages/ErrorPage'
import { userConfirmation } from './api'
import FoodLogPage from './pages/FoodLogPage'

const router = createBrowserRouter([
    {
        path:"/",
        // get user token if exists & user data before <App/> renders
        loader: userConfirmation,
        element: <App/>,
        errorElement: <ErrorPage/>,
        children:[
            {
                index:true,
                element:<HomePage/>
            },
            {
                path:"/signup/",
                element:<SignUp/>
            },
            {
                path:"/login/",
                element: <LogIn/>
            },
            {
                path:"/foodlog/",
                element: <FoodLogPage/>
            }
        ]
    }
])

export default router;