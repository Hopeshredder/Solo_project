import axios from 'axios';
import { api } from './utilities';


export const registerUser = async (email, password, first_name, last_name) => {
    try {
        const response = await api.post("users/signup/", {
            email,
            password,
            first_name,
            last_name
        });

        console.log('registerUser response data', response.data);

        if (response.status === 201) {
            const { user, token } = response.data;
            localStorage.setItem("token", token);
            api.defaults.headers.common["Authorization"] = `Token ${token}`;
            return user;
        }

        return null;
    } catch (error) {
        console.error("Signup failed:", error.response?.data || error.message);
        throw error;
    }
}

export const loginUser = async (email, password) => {
    const response = await api.post("users/login/", { email, password});
    // console.log(response)
    if (response.status === 200) {
        const { user, token} = response.data;
        localStorage.setItem("token", token);
        api.defaults.headers.common["Authorization"] = `Token ${token}`
        console.log(user)
        return user;
    }

    // error case
    console.log('loginUser Error', response.data);
    return null;
}


export const logoutUser = async () => {
    // hit the logout endpoint
    console.log('logoutUser, api headers', api.defaults.headers.common)
    const response = await api.post("users/logout/")
    if (response.status === 204) {
        // delete token from localstorage
        localStorage.removeItem("token")
        // delete token from axios api instance
        delete api.defaults.headers.common["Authorization"];
        return null
    }

    console.log('logoutUser logout failed')
}


// Check if auth token exists clientside already
export const userConfirmation = async() => {
    console.log('userConfirmation()')
    const token = localStorage.getItem("token");
    if (token) {
        console.log('got token ', token)
        api.defaults.headers.common["Authorization"] = `Token ${token}`
        // get basic user info and the default user data we want to display
        const response = await api.get("users/info/")
        console.log(response)
        if (response.status === 200) {
            console.log('made api call', response.data.user)
            return response.data.user;
        }
        console.log('userConfirmation returned response other than 200', response.data);
    }
    console.log('userConfirmation error');
    return null;
}

// Gives an image from Unsplash without saving to a DB for the preview
export const previewFoodImages = async (query) => {
  const res = await api.get("images/search/", { params: { q: query } });
  return res.data.images; // [{ id, alt, thumb, full, credit }, ...]
};


// Add an image to an existing food log (returns { foodlog, credit })
export const setFoodLogImage = async (foodLogId, query) => {
  const res = await api.patch(`images/foodlogs/${foodLogId}/set/`, { q: query });
  return res.data; // { foodlog: {...}, credit: {...} }
};

export const createFoodLog = async (payload) => {
    const res = await api.post('/foods/', payload);              
    return res.data;
};

// Gets a total calorie number for the given day
export const getDailyCalories = async (dateStr) => {
    // Grabs a day object based off of a given day (YYYY-MM-DD format)
    const res = await api.get(`dates/days/`, { params: { date: dateStr } });
    // returns the total calories of the given day
    return res.data?.total_calories ?? 0;
};