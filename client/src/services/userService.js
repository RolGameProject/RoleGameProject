import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Obtener la información del usuario autenticado
export const getCurrentUser = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/auth/user`, { withCredentials: true });
        return response.data;  
    } catch (error) {
        console.error('Error al obtener el usuario autenticado:', error);
        return null;
    }
};
