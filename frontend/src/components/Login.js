import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission

        // Log values to see if they're being captured correctly
        console.log('Username:', username);
        console.log('Password:', password);

        // Send a POST request to the login endpoint
        axios.post('http://localhost:5000/budgets/login', { username, password })
            .then(response => {
                console.log(response.data);
                alert('Login successful!');
            })
            .catch(error => {
                console.error('There was an error logging in!', error);
                if (error.response) {
                    // Log the actual error message from the server
                    console.error('Error data:', error.response.data);
                    alert('Login failed: ' + error.response.data.message);
                } else {
                    alert('Login failed: ' + error.message);
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
                    onChange={e => setUsername(e.target.value)} 
                />
                <label>Password: </label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
