import { useOutletContext } from "react-router-dom";
const HomePage = () => {
    const { user } = useOutletContext()

    return(
        <>
            <h1>HomePage</h1>
            {user ? (
                <h2>{user?.first_name}'s Homepage!</h2>
            ) : (
                <h2>Please Sign Up or Sign In</h2>
            )}
        </>
    )
}

export default HomePage;