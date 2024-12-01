// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Corregimos Router
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GameRoom from './pages/GameRoom';
import Navbar from './components/Navbar';
import './styles/styles.css';

function App() {
  console.log("Cargando la aplicación");

  return (
    <Router> 
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game-room" element={<GameRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
