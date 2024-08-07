import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const HomePage = () => {
    const [userEmail, setUserEmail] = useState('');
    const [friends, setFriends] = useState([]);
    const [notifications, setNotifications] = useState([]);
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

    const removeFriend = async (friendEmail) => {
        try {
            await axios.delete(`http://localhost:3001/remove-friend/${friendEmail}`);
            setFriends(friends.filter((friend) => friend.email !== friendEmail));
        } catch (error) {
            console.log(error);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:3001/auth/logout', { withCredentials: true });
            navigate('/login');
        } catch (error) {
            console.error('Error logging out', error);
        }
    };

    const fetchNotifications = async () =>{
        try{
            const response = await axios.get('http://localhost:3001/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const handleNotificationClick = async (notification) => {
        notification.isRead = true;
        try{
            await axios.put(`http://localhost:3001/update-notification/${notification._id}`, notification);
        } catch(error){
            console.log(error)
        }
        window.location.href = notification.link;
    };

    const deleteProfile = async () =>{
        try{
            await axios.delete('http://localhost:3001/delete-profile');
            navigate('/login');
        } catch(error){
            console.log(error);
        }
    };
    return (
        <div>
            <h1>Welcome to the Home Page</h1>

            {userEmail ? (
                <div>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <p>Loading...</p>
            )}

            <button onClick={fetchNotifications}>Fetch Notifications</button>
            
            {notifications && notifications.length > 0 ? (
                <div>
                    <h2>Notifications:</h2>
                    <ul>
                        {notifications.map((notification, index) => (
                            <li key={index}>
                                <p>{notification.message || 'No message available'}</p>
                                {notification.link ? (
                                    <button onClick={() => handleNotificationClick(notification)}>
                                        Go to Link
                                    </button>
                                ) : (
                                    <p>No link available</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No notifications</p>
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
                                <button onClick={() => removeFriend(friend.email)}>Remove Friend</button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No friends found.</p>
            )}

    <Link to="/chatRequest"><button>Add Friends</button></Link>
    <button onClick={deleteProfile}>Delete Profile</button>
        </div>
    );
};

export default HomePage;