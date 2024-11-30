// src/pages/Login.js
import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

const BACKENDURL=process.env.REACT_APP_BACKEND_URL;

function Login() {
  // const navigate = useNavigate();

  // Función para redirigir a Google OAuth
  const handleLogin = () => {
    window.location.href = BACKENDURL + '/api/auth/google';
  };

  return (
    <div className="text-center mt-5">
      <h2>Inicia sesión</h2>
      <button className="btn btn-primary" onClick={handleLogin}>Iniciar sesión con Google</button>
    </div>
  );
}

export default Login;
