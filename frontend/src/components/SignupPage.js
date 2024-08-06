import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './SignupPage.css';  

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    axios.defaults.withCredentials = true;
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        } else {
            try {
                const response = await axios.post('http://localhost:3001/signup', {
                    name,
                    email,
                    password
                });
                setMessage(response.data.message);
                if (response.data.loginStatus) {
                    window.location.href = '/home';
                }
            } catch (error) {
                setMessage('Signup failed');
            }
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Name" required onChange={(e) => setName(e.target.value)} />
                <input type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
                <input type="password" placeholder="Confirm Password" required onChange={(e) => setConfirmPassword(e.target.value)} />
                <button type="submit">Signup</button>
            </form>
            <Link to="/login"><button type="button">Already have an acount? Login</button></Link>
            {message && <p className="error">{message}</p>}
        </div>
    );
};


export default SignupPage;
