// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.js';
// import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// import CreateCharacter from './pages/CreateCharacter';
// import CharacterList from './pages/CharacterList';
// import CreateEnemy from './pages/CreateEnemy';
// import EnemyList from './pages/EnemyList';
import GameRoom from './pages/GameRoom';
// import Interaction from './pages/Interaction';
// import TurnManagement from './pages/TurnManagement';
import LoadingSpinner from './components/LoadingSpinner';
import './styles/styles.css';

const BACKENDURL=process.env.REACT_APP_BACKEND_URL;

function App() {
  console.log('App cargando correctamente');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(BACKENDURL + '/api/auth/success', { withCredentials: true });
        setIsAuthenticated(response.data.authenticated);
      } catch (error) {
        console.error('Error de autenticación:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);
  
  // Mostrar el spinner de carga mientras se verifica la autenticación
  // if (loading) {
  //   return <LoadingSpinner />;
  // }

  return (
    <Router>
      {isLoading ? (
        <LoadingSpinner />
        ) : (
          <>
            <Navbar isAuthenticated={isAuthenticated} />
            <div className="container mt-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/game-room" element={<GameRoom />} />
            </Routes>
            </div>
          </>
        )}
    </Router>
  );
}

export default App;
