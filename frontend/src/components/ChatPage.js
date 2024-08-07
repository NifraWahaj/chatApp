import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import axios from 'axios';

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
            <h2>Chatting with {friendEmail}</h2>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg.content} ({msg.sender}) {new Date(msg.timestamp).toLocaleTimeString()}</li>
                ))}
            </ul>
            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message"
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default ChatPage;
