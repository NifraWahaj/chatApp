import React from 'react';
import './DefaultPage.css';
import logo from '../assets/logo.png';

const DefaultPage = () => {
    return (
        <div className="landing-container">
            <header className="landing-header">
                <img src={logo} alt="Buzz Logo" className="logo" />
                <h1 className='h1-title'>Buzz</h1>
                <p className="tagline">"Connect, Chat, and Share Moments"</p>
                <div className="cta-buttons">
                    <a href="/login" className="cta-button">Login</a>
                    <a href="/signup" className="cta-button">Sign Up</a>
                </div>
            </header>
        </div>
    );
};

export default DefaultPage;