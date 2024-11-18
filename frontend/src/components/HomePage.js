import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './HomePage.css';
import PrimarySearchAppBar from './PrimarySearchAppBar';
import { ToastContainer } from "react-toastify";

const HomePage = () => {
    const [userEmail, setUserEmail] = useState('');
    const [friends, setFriends] = useState([]);
    const [chats, setChats] = useState([]);
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

        const fetchChats = async () =>{
            try{
                const response = await axios.get('http://localhost:3001/get-chats');
                setChats(response.data);
            }catch (error) {
                console.log(error);
            }
        }

        fetchFriends();
        fetchUser();
        fetchChats();
    }, []);

    const startChat = async (friendEmail) => {
        navigate(`/chat/${friendEmail}`);
    };

    const removeFriend = async (friendEmail) => {
        try {
            await axios.delete(`http://localhost:3001/remove-friend/${friendEmail}`);
            setFriends(friends.filter((friend) => friend.email !== friendEmail));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div> 
             <PrimarySearchAppBar />
             <ToastContainer />
        <div className="homepage-container">
        
            <div className="welcome-container">
                <h1>Welcome, {userEmail || 'Loading...'}</h1>
            </div>

            <div className="friends-section">
                <h2>Your Friends</h2>
                {friends.length ? (
                    <ul className="friends-list">
                        {friends.map((friend, index) => (
                            <li key={index}>
                                <span className="friend-email">{friend.email}</span>
                                <div className="actions">
                                    <button onClick={() => startChat(friend.email)}>Chat</button>
                                    <button onClick={() => removeFriend(friend.email)}>Remove</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No friends found.</p>
                )}
                <div className="add-friends-button-container">
                    <Link to="/chatRequest" className="add-friends-button">
                        Add Friends
                    </Link>
                </div>
            </div>

            <div className="chats-section">
                <h2>Recent Chats</h2>
                {chats.length ? (
                    <ul className="chats-list">
                        {chats.map((chat, index) => {
                            const friendEmail = chat.participants.find((email) => email !== userEmail);
                            return (
                                <li key={index}>
                                    <p>{friendEmail}</p>
                                    <button onClick={() => startChat(friendEmail)}>Open Chat</button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>No recent chats</p>
                )}
            </div>
        </div>
        </div>
    );
};

export default HomePage;
