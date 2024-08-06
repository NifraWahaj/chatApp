import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css'; 

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    axios.defaults.withCredentials = true;
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:3001/auth/google';
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/login', {
                email,
                password
            });
            setMessage(response.data.message);
            if (response.data.loginStatus === true) {
                window.location.href = '/home';
            }
        } catch (error) {
            setMessage('Login failed');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    required 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    required 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <button type="submit">Login</button>
            </form>
            <Link to="/signup">
                <button type="button">Don't have an account? Signup</button>
            </Link>
            <button type = "button" onClick={handleGoogleLogin}>Login with Google</button>

            {message && <p className="error">{message}</p>}
        </div>
    );
};

export default LoginPage;
