import React, { useState, useEffect, Link } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [userEmail, setUserEmail] = useState('');
    const [friends, setFriends] = useState([]);

    const navigate = useNavigate();

    axios.defaults.withCredentials = true;
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:3001/get-user');
                setUserEmail(response.data.email);
            } catch (error) {
                console.log(error);
                setUserEmail('');
            }
        };

        const fetchFriends = async () => {
            try {
                const response = await axios.get('http://localhost:3001/get-friends');
                setFriends(response.data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchFriends();
        fetchUser();
    }, []);

    const startChat = async (friendEmail) => {
        navigate(`/chat/${friendEmail}`);
    };

    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:3001/auth/logout', { withCredentials: true });
            navigate('/login'); 
        } catch (error) {
            console.error('Error logging out', error);
        }
    };

    return (
        <div>
            <h1>Welcome to the Home Page</h1>

            {userEmail ? (
                <div>
                    <p>Email: {userEmail}</p>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <p>Loading...</p>
            )}

            {userEmail ? <p>Email: {userEmail}</p> : <p>Loading...</p>}
            {friends.length > 0 ? (
                <div>
                    <h2>Friends:</h2>
                    <ul>
                        {friends.map((friend, index) => (
                            <li key={index}>
                                {friend.email}
                                <button onClick={() => startChat(friend.email)}>Start Chatting</button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No friends found.</p>
            )}
        </div>
    );
};

export default HomePage;