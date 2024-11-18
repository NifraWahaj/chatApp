import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./ChatRequestPage.css";

const ChatRequestPage = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showRequests, setShowRequests] = useState(false);
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3001/all-users', { withCredentials: true });
                setUsers(response.data);
            } catch (error) {
                setError('Error fetching users');
            }
        };

        fetchUsers();
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const fetchChatRequests = async () => {
        try {
            const response = await axios.get('http://localhost:3001/get-chat-requests', { withCredentials: true });
            setRequests(response.data);
            setShowRequests(true);
            setError('');
        } catch (err) {
            setError('Error fetching chat requests');
        }
    };

    const handleAccept = async (request) => {
        try {
            await axios.post('http://localhost:3001/accept-chat-request', {
                id: request._id,
                to: request.to,
                from: request.from
            }, { withCredentials: true });

            setMessage('Chat request accepted');
            setError('');
            fetchChatRequests();
        } catch (err) {
            setError('Error accepting chat request');
        }
    };

    const handleReject = async (request) => {
        try {
            await axios.post('http://localhost:3001/reject-chat-request', {
                to: request.from,
                id: request._id
            }, { withCredentials: true });

            setMessage('Chat request rejected');
            setError('');
            fetchChatRequests();
        } catch (err) {
            setError('Error rejecting chat request');
        }
    };

    const handleSendChatRequest = async (recipientEmail) => {
        try {
            const response = await axios.post('http://localhost:3001/send-chat-request', { to: recipientEmail }, { withCredentials: true });
            setMessage(response.data.message);
            setError('');
        } catch (err) {
            setError('Error sending chat request');
        }
    };

    return (
        <div>
            <div className="search-container">
                <h2 className="search-title">Search Users</h2>
                <div className="search-input-container">
                    <input
                        type="text"
                        placeholder="Search by email"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    <span className="search-icon"></span>
                </div>

                {users.length === 0 && <p className="no-results">No users found</p>}

                <div className="user-list">
                    {users
                        .filter(user => user.email.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(user => (
                            <div key={user.email} className="user-item">
                                <p className="user-info">{user.name} ({user.email})</p>
                                <button className="send-request-button" onClick={() => handleSendChatRequest(user.email)}>Send Chat Request</button>
                            </div>
                        ))}
                </div>

                <button className="show-requests-button" onClick={fetchChatRequests}>Show Pending Requests</button>

                {showRequests && (
                    <div className="requests-container">
                        <h2 className="requests-title">Pending Chat Requests</h2>
                        {requests.length === 0 && <p className="no-results">No pending requests</p>}
                        {requests.map((request) => (
                            <div key={`${request.from}-${request.to}`} className="request-item">
                                <p>{request.from} wants to chat with you</p>
                                <button className="accept-button" onClick={() => handleAccept(request)}>Accept</button>
                                <button className="reject-button" onClick={() => handleReject(request)}>Reject</button>
                            </div>
                        ))}
                    </div>
                )}

                {message && <p className="status-message">{message}</p>}
                {error && <p className="status-error">{error}</p>}
            </div>
        </div>
    );
};

export default ChatRequestPage;
