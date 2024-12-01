// src/App.js

// import React, { useState, useEffect } from 'react';

import { BrowserRouter as Route, Routes } from 'react-router-dom';

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

import Navbar from './components/Navbar.js';

// import LoadingSpinner from './components/LoadingSpinner';

import './styles/styles.css';



// const BACKENDURL=process.env.REACT_APP_BACKEND_URL;



function App() {

  console.log('App cargando correctamente');

  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // const [loading, setLoading] = useState(true);



  // Verificar si el usuario está autenticado

  // useEffect(() => {



  // }, []);



  // Mostrar el spinner de carga mientras se verifica la autenticación

  // if (loading) {

  //   return <LoadingSpinner />;

  // }



    return (
    <>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game-room" element={<GameRoom />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
