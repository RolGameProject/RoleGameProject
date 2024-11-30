import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Estado inicial desconocido
  const [loadingAuth, setLoadingAuth] = useState(true); // Comienza en carga
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/api/auth/status'); // Endpoint para verificar autenticación
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setIsAuthenticated(false); // Si ocurre un error, asumimos que no está autenticado
      } finally {
        setLoadingAuth(false); // Finaliza la carga
      }
    };

    checkAuthStatus();
  }, []);

  // Mostrar el spinner mientras verifica autenticación
  if (loadingAuth) {
    return <LoadingSpinner />;
  }

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Renderizar los hijos si está autenticado
  return children;
};

export default ProtectedRoute;
