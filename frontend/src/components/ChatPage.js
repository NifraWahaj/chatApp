import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "./ChatPage.css";
import PrimarySearchAppBar from './PrimarySearchAppBar';

const ChatPage = () => {
    const { friendEmail } = useParams();
    const [chatId, setChatId] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const socketInstance = io('http://localhost:3001');
            setSocket(socketInstance);

            try {
                // Fetch current user email
                const response = await axios.get('http://localhost:3001/get-user');
                setCurrentUserEmail(response.data.email);

                // Only fetch chat if we have valid emails
                if (currentUserEmail && friendEmail) {
                    const chatResponse = await axios.post('http://localhost:3001/create-or-fetch-chat', {
                        participants: [currentUserEmail, friendEmail]
                    });
                    
                    const chatData = chatResponse.data;
                    if (chatData && chatData._id) {
                        setChatId(chatData._id);
                        setMessages(chatData.messages || []);
                        socketInstance.emit('join room', chatData._id);
                    } else {
                        console.error('Invalid chat data received:', chatData);
                    }
                } else {
                    console.error('Invalid participant emails:', { currentUserEmail, friendEmail });
                }
            } catch (error) {
                console.error('Error fetching user or chat data:', error);
            }

            socketInstance.on('chat message', (msg) => {
                console.log('Received message:', msg);
                setMessages((prevMessages) => [...prevMessages, msg]);
            });

            return () => {
                socketInstance.off('chat message');
                socketInstance.disconnect();
            };
        };

        fetchData();
    }, [friendEmail, currentUserEmail]);

    const sendMessage = () => {
        if (socket && chatId && message.trim()) {
            socket.emit('chat message', {
                content: message.trim(),
                chatId: chatId,
                sender: currentUserEmail
            });
            setMessage('');
        } else {
            console.error('Cannot send empty message or invalid chatId');
        }
    };

    return (
        <div>
            <PrimarySearchAppBar />
            <div className="chat-container">
            <h2 className="chat-title">Chatting with {friendEmail}</h2>
            <ul className="messages-list">
                {messages.map((msg, index) => (
                    <li
                        className={`message-item ${msg.sender === currentUserEmail ? 'current-user' : 'other-user'}`}
                        key={index} >
                        <div className="message-sender">{msg.sender}</div>
                        <div className="message-content">{msg.content}</div>
                        <div className="message-timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                    </li>
                ))}
            </ul>
            <div className="button-container">
                    <input
                        className="input-container"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message"
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
        </div>
    </div>
    );
};

export default ChatPage;
