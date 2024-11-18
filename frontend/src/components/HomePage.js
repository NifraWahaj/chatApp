import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './HomePage.css';  
import PrimarySearchAppBar from './PrimarySearchAppBar';
import { ToastContainer, toast } from "react-toastify";

const HomePage = () => {
    const [userEmail, setUserEmail] = useState('');
    const [friends, setFriends] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [chats, setChats] = useState([]);
    //const [cookies, removeCookie] = useCookies(['token']);
    const navigate = useNavigate();

    axios.defaults.withCredentials = true;

    // useEffect(() => {
    //     const verifyCookie = async () => {
    //       console.log("Checking cookie:", cookies.token);
      
    //       if (!cookies.token) {
    //         console.log("No token found, redirecting to login.");
    //         navigate("/login");
    //         return;
    //       }
      
    //       try {
    //         const response = await axios.post('http://localhost:3001/verify', {}, { withCredentials: true });
    //         if (response.data.status) {
    //           setUserEmail(response.data.user);
    //         } else {
    //           console.log("Invalid token, redirecting to login.");
    //           removeCookie('token');
    //           navigate('/login');
    //         }
    //       } catch (error) {
    //         console.log("Error during verification:", error);
    //         removeCookie('token');
    //         navigate('/login');
    //       }
    //     };
      
    //     verifyCookie();
    //   }, [cookies, navigate, removeCookie]);

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

    const handleLogout = async () => {
        try {
            await axios.get('http://localhost:3001/auth/logout', { withCredentials: true });
            navigate('/login');
        } catch (error) {
            console.error('Error logging out', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            console.log("Fetching notifications...");
            const response = await axios.get('http://localhost:3001/notifications');
            
            const sortedNotifications = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            const formattedNotifications = sortedNotifications.map(notification => {
                const date = new Date(notification.timestamp);
                const formattedDate = date.toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                const formattedTime = date.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
    
                return {
                    ...notification,
                    formattedTimestamp: `${formattedTime} ${formattedDate}`
                };
            });
            
            setNotifications(formattedNotifications);
        } catch (error) {
            console.log('Error fetching notifications:', error);
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

    const deleteNotification = async (notification) =>{
        try{
            await axios.delete(`http://localhost:3001/delete-notification/${notification._id}`);
            setNotifications(notifications.filter(n => n._id !== notification._id));
        } catch(error){
            console.log(error);
        }
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
            <PrimarySearchAppBar />

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
                                <p>{notification.formattedTimestamp}</p>
                                <p>{notification.read}</p>
                                {notification.read ? (
                                    <button onClick={() => deleteNotification(notification)}>
                                       Delete
                                   </button>) : (<p>Notification is unread</p>)}
                                   
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


    <h1>Dive back in</h1>
    {chats.length > 0 ? (
                <div>
                    <h2>Chats:</h2>
                    <ul>
                        {chats.map((chat, index) => {
                            const friendEmail = chat.participants.find(email => email !== userEmail);
                            const lastMessageTime = chat.lastMessageTime ? new Date(chat.lastMessageTime) : null;
                            const formattedLastMessageTime = lastMessageTime ? lastMessageTime.toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : 'No messages';

                            return (
                                <li key={index}>
                                    <p>{friendEmail}</p>
                                    <p>Last message at: {formattedLastMessageTime}</p>
                                    <button onClick={() => startChat(friendEmail)}>Open Chat</button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ) : (
                <p>No chats available.</p>
            )}

        </div>
    );

    
};
export default HomePage;