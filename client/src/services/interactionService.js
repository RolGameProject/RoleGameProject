// src/services/interactionService.js
import axios from 'axios';

const API_URL=process.env.REACT_APP_BACKEND_URL + 'api/interaction/interact'

// Función para realizar la interacción entre un personaje y un enemigo
export const interact = async (character, enemy, selectedStat, diceType) => {
  try {
    const response = await axios.post(
      API_URL, 
      { character, enemy, selectedStat, diceType },
      { withCredentials: true }
    );
    return response.data; // Retorna el resultado de la interacción
  } catch (error) {
    console.error('Error en la interacción:', error);
    throw error; // Propaga el error para manejarlo en el componente
  }
};
