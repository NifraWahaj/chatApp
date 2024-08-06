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
        const socketInstance = io('http://localhost:3001');
        setSocket(socketInstance);

        axios.get('http://localhost:3001/get-user')
            .then(response => {
                setCurrentUserEmail(response.data.email);
            })
            .catch(error => {
                console.error('Error fetching user email:', error);
            });


        axios.post('http://localhost:3001/create-or-fetch-chat', {
            participants: [currentUserEmail, friendEmail]
        })
        .then(response => {
            const chatData = response.data;
            setChatId(chatData._id);
            setMessages(chatData.messages || []);
            socketInstance.emit('join room', chatData._id);
        })
        .catch(error => {
            console.error('Error creating or fetching chat:', error);
        });

        socketInstance.on('chat message', (msg) => {
            console.log('Received message:', msg);
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socketInstance.off('chat message');
            socketInstance.disconnect();
        };
    }, [friendEmail]);

    const sendMessage = () => {
        if (socket && chatId) {
           
            socket.emit('chat message', {
                content: message,          
                chatId: chatId,           
                sender: currentUserEmail   
            });
            setMessage('');  
        }
    };
    

    return (
        <div>
            <h2>Chatting with {currentUserEmail} And {friendEmail}</h2>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg.content} {msg.sender} {new Date(msg.timestamp).toLocaleTimeString()}</li>
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
