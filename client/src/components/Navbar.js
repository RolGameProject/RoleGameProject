// src/components/Navbar.js
import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKENDURL=process.env.REACT_APP_BACKEND_URL;

function NavbarComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Comprobar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(BACKENDURL + '/api/auth/success', { withCredentials: true });
        setIsAuthenticated(response.data.authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();

  }, []);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      const response = await axios.get(BACKENDURL + '/api/auth/logout', {
        withCredentials: true,
      });
      if (response.status === 200) {
        setIsAuthenticated(false); // Actualiza el estado de autenticación
        navigate('/'); // Redirige al inicio

      } else {
        console.error('Error al cerrar sesión:', response.data.message);
      }
    } catch (error) {
      console.error('Error en el cierre de sesión:', error.response?.data || error.message);
    }
  };

  return (
    <Navbar id="main-navbar" bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand onClick={() => navigate('/')}>
          <img
            src="/assets/ROLE_GAME_PROJECT_BANNER.png"
            alt="Role Game Project Banner"
            style={{ maxWidth: '50px', height: 'auto' }}
          />
        </Navbar.Brand>
        <Nav className="ml-auto">
          <Nav.Link as={Link} to="/">Inicio</Nav.Link>
          {isAuthenticated ? (
            <>
              <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/game-room">Partida</Nav.Link>
              <Nav.Link onClick={handleLogout}>Cerrar sesión</Nav.Link>
            </>
          ) : (
            <Nav.Link as={Link} to="/login">Iniciar sesión</Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
