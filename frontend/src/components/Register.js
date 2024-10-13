import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState(''); // State for email
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post('http://localhost:5000/budgets/register', { username, password, email });
            console.log(response.data);
            alert('Registration successful!');
            navigate('/login'); // Redirect to login page after successful registration
        } catch (error) {
            console.error('There was an error registering!', error);
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <label>Username: </label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                <label>Password: </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <label>Email: </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} /> {/* Email input */}
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
