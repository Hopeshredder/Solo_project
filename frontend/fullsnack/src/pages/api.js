import axios from 'axios';


export const registerUser = async (email, password) => {
    const response = await api.post("users/signup/", { email, password });

    console.log('registerUser response data', response.data);

    if (response.status === 201) {
        const { user, token } = response.data;
        // Save auth token in browser localStorage
        localStorage.setItem("token", token);
        // Set my axios api instance to use the auth token on all requests
        // Adds to Request Headers: 
        // Authorization Token XYZ123
        api.defaults.headers.common["Authorization"] = `Token ${token}`
        console.log('success', user)
        return user;
    }

    return null;
}

export const loginUser = async (email, password) => {
    const response = await api.post("users/login/", { email, password});
    if (response.status === 200) {
        const { user, token} = response.data;
        localStorage.setItem("token", token);
        api.defaults.headers.common["Authorization"] = `Token ${token}`
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
        const response = await api.get("users/")
        if (response.status === 200) {
            console.log('made api call', response.data.user)
            return response.data.user;
        }
        console.log('userConfirmation returned response other than 200', response.data);
    }
    console.log('userConfirmation error');
    return null;
}















/** Pokemon API */

// axios api instance for interacting with pokemon api
export const pokeApi = axios.create({
    baseURL: "https://pokeapi.co/api/v2/",
})