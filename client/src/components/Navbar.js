// src/components/Navbar.js
import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKENDURL=process.env.REACT_APP_BACKEND_URL;
console.log('Backend URL:', BACKENDURL);

function NavbarComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  console.log('Dentro de Navbar component');
  // Comprobar autenticación
  useEffect(() => {
    console.log('Se ha entrado en useEffect');
    const checkAuth = async () => {
    console.log('Verificando autenticación...');
      try {
        const response = await axios.get(BACKENDURL + '/api/auth/success', { withCredentials: true });
        console.log('Auth response:', response.data);
        setIsAuthenticated(response.data.authenticated);
      } catch (error) {
        console.error('Error de autenticación:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false); // Carga finalizada
      }
    };
    checkAuth();
  }, [checkAuth()]);

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
  
  if (loading) {
  console.log('Cargando...');
    return null; // Puedes devolver un Spinner aquí
  }

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
          {/* Evitar redirecciones innecesarias */}
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
