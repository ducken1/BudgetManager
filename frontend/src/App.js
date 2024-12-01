// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import axios from 'axios';



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    const loggedInUser = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    const verifyUser = async () => {
      if (loggedInUser && token) {
        try {
          // Verify user existence
          const response = await axios.get('http://localhost:3000/budgets/verify-user', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.status === 200) {
            setIsLoggedIn(true);
            setUsername(loggedInUser);
          } else {
            // User doesn't exist, clear localStorage
            handleLogout();
          }
        } catch (error) {
          // User doesn't exist or token is invalid
          handleLogout();
        }
      } else {
        setLoading(false); // No user is logged in
      }
      setLoading(false); // Set loading to false after the check
    };

    verifyUser();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    localStorage.removeItem('username'); // Clear the username from local storage
    localStorage.removeItem('token');    // Clear the token from local storage
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading state while checking authentication
  }

  return (
    <Router>
      <div className="App">
        <Header isLoggedIn={isLoggedIn} username={username} onLogout={handleLogout} />
        <Routes>
          <Route path="/register" element={isLoggedIn ? <div>You're already logged in!</div> : <Register />} />
          <Route path="/login" element={isLoggedIn ? <div>You're already logged in!</div> : <Login setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />} />
          <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
