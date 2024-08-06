import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage.js';
import SignupPage from './components/SignupPage';
import DefaultPage from './components/DefaultPage';
import HomePage from './components/HomePage';
import ChatRequestPage from './components/ChatRequestPage';
import ChatPage from './components/ChatPage';
function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element = {<DefaultPage/>} />
        <Route path = "/login" element = {<LoginPage/>} />
        <Route path = "/signup" element = {<SignupPage/>} />
        <Route path = "/home" element = {<HomePage/>} />
        <Route path="/chat/:friendEmail" element={<ChatPage />} />
        <Route path = "/chatRequest" element = { <ChatRequestPage />} />
      </Routes>
    </Router>
  );
}

export default App;
