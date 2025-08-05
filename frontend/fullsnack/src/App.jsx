import { useEffect, useState } from 'react'
import './App.css'
import NavBar from './components/NavBar'
import { Outlet, useLoaderData, useNavigate } from 'react-router-dom'
import { api } from './utilities'

function App() {
  const [user, setUser] = useState(useLoaderData());

  const testConnection = async() => {
    const response = await api.get("users/test")
    console.log(response)
  }

  useEffect(() => {
    testConnection()
  });

  // Controls what someone who is not logged in can access/ vice versa
  const navigate = useNavigate();
  useEffect(() => {
    const allowedLoggedOutPages = ["/login", "/signup"];
    const isAllowed = allowedLoggedOutPages.includes(location.pathname);
    if (user && isAllowed) {
      navigate('/');
    } 
  }, [location.pathname, user])

  const contextObj = {user, setUser}

  return (
    <>
      <NavBar user={user} setUser={setUser} />
      <Outlet context={contextObj} />
    </>
  )
}

export default App