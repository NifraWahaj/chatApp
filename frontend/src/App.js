import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage.js';
import SignupPage from './components/SignupPage';
import DefaultPage from './components/DefaultPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element = {<DefaultPage/>} />
        <Route path = "/login" element = {<LoginPage/>} />
        <Route path = "/signup" element = {<SignupPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
