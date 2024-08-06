import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatRequestPage = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    //
    const [showRequests, setShowRequests] = useState(false);
    const [requests, setRequests] = useState([]);

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUsers = async () =>{
            try{
                const response = await axios.get('http://localhost:3001/all-users', { withCredentials: true });
                setUsers(response.data);
            } catch(error){
                setError('Error fetching users');
            }
        }

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
            <h2>Search Users</h2>
            <input
                type="text"
                placeholder="Search by email"
                value={searchQuery}
                onChange={handleSearchChange}
            />

            {users.length === 0 && <p>No users found</p>}
            
            {users
                .filter(user => user.email.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(user => (
                    <div key={user.email}>
                        <p>{user.name} ({user.email})</p>
                        <button onClick={() => handleSendChatRequest(user.email)}>Send Chat Request</button>
                    </div>
            ))}

            <button onClick={fetchChatRequests}>Show Pending Requests</button>

            {showRequests && (
                <div>
                    <h2>Pending Chat Requests</h2>
                    {requests.length === 0 && <p>No pending requests</p>}
                    {requests.map((request) => (
                        <div key={`${request.from}-${request.to}`}>
                            <p>{request.from} wants to chat with you</p>
                            <button onClick={() => handleAccept(request)}>Accept</button>
                            <button onClick={() => handleReject(request)}>Reject</button>
                        </div>
                    ))}
                </div>
            )}
            
            {message && <p>{message}</p>}
            {error && <p>{error}</p>}
        </div>
    );
};

export default ChatRequestPage;
