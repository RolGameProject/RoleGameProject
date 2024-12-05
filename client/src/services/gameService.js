// src/services/gameService.js
import axios from 'axios';
import { getCurrentUser } from './userService'; // Ajusta la ruta según tu estructura de carpetas

const API_URL = process.env.REACT_APP_BACKEND_URL;  // Cambia esto por la URL de tu servidor en producción si es necesario

// Crear una nueva partida
export const createGame = async (gameData) => {
  try {
    const user = await getCurrentUser();  // Obtener el usuario autenticado

    if (!user) {
      console.error('Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }

    const gameMaster = user.userId;  

    const response = await axios.post(
      `${API_URL}/api/games/create`,
      { ...gameData, gameMaster }, 
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    console.error('Error creando la partida:', error);
    throw error;
  }
};

//Obtener todas las partidas
export const getAllGames = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/games/all`,
      { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo todas las partidas:', error);
    throw error;
  }
};


// Unirse a una partida existente
export const joinGame = async (gameData) => {
  try {
    const user = await getCurrentUser();  // Obtener el usuario autenticado

    if (!user) {
      console.error('Usuario no autenticado');
      throw new Error('Usuario no autenticado');
    }

    const playerId = user.userId;

    console.log('Datos enviados al servidor para unirse:', { ...gameData, playerId }); // Log de los datos enviados
    
    const response = await axios.post(
      `${API_URL}/api/games/join`,
      { ...gameData, playerId },
      { withCredentials: true });
    
      console.log('Respuesta del servidor al unirse:', response.data); // Log de la respuesta

    return response.data;
  } catch (error) {
    console.error('Error joining game:', error);
    throw error;
  }
};

// Obtener los detalles de una partida específica
export const getGameDetails = async (gameId) => {
  try {
    const response = await axios.get(`${API_URL}/api/games/${gameId}/details`, { withCredentials: true });
    return response.data; // Devolver los datos de la partida
  } catch (error) {
    console.error('Error obteniendo detalles de la partida:', error);
    throw error;
  }
};

// Guardar el estado del juego al final del turno
export const saveGameStateAtTurnEnd = async (gameState) => {
  try {
    const response = await axios.post(`${API_URL}/api/games/saveGameStateAtTurnEnd`, gameState, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error saving game state at turn end:', error);
    throw error;
  }
};

// Finalizar una partida
export const endGame = async (gameId) => {
  try {
    const response = await axios.post(`${API_URL}/api/games/endGame`, { gameId }, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error ending game:', error);
    throw error;
  }
};

// Finalizar el turno de un jugador o del máster
export const finishTurn = async (gameId) => {
  try {
    const response = await axios.post(`${API_URL}/api/games/finishTurn`, { gameId }, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error finishing turn:', error);
    throw error;
  }
};
