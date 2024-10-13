// src/components/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Login = ({ setIsLoggedIn, setUsername }) => {
  const [username, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission

    // Send a POST request to the login endpoint
    axios
      .post("http://localhost:5000/budgets/login", { username, password })
      .then((response) => {
        const token = response.data.token; // Assume token is sent from backend
        console.log(response.data);
        alert("Login successful!");
        setIsLoggedIn(true);
        setUsername(username);
        localStorage.setItem("username", username); // Store username
        localStorage.setItem("token", token); // Store JWT token in localStorage

        // Redirect to the welcome page after successful login
        navigate("/"); // Change this to the desired redirect path
      })
      .catch((error) => {
        console.error("There was an error logging in!", error);
        if (error.response) {
          alert("Login failed: " + error.response.data.message);
        } else {
          alert("Login failed: " + error.message);
        }
      });
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Username: </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsernameInput(e.target.value)}
        />
        <label>Password: </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
