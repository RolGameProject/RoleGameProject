// src/services/characterService.js
import axios from 'axios';
// import { user } from '../../../server/discordClient';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api/characters'; // Reemplaza con tu URL de la API

// Obtener todos los personajes
export const getAllCharacters = async () => {
  try {
    const response = await axios.get(API_URL);  // Esto ya está correcto
    return response.data;
  } catch (error) {
    console.error("Error al obtener los personajes", error);
    throw error;
  }
};

// Crear un nuevo personaje
export const createCharacter = async (characterData) => {
  try {
    // console.log("Datos enviados para crear personaje:", characterData);
    const response = await axios.post(API_URL, characterData, {
      withCredentials: true,
    });
    // Log para verificar la respuesta del servidor
    // console.log("Respuesta del servidor al crear personaje:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error al crear el personaje", error?.response?.data || error);
    throw error;
  }
};

export const getCharactersByUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/user`, {
      withCredentials: true, // Habilita el envío de cookies en solicitudes CORS
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener los personajes", error);
    throw error;
  }
};


// Obtener un personaje por ID
export const getCharacterById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);  // Aquí ya tenemos la ruta correcta
    return response.data;
  } catch (error) {
    console.error("Error al obtener el personaje", error);
    throw error;
  }
};

// Actualizar un personaje por ID
export const updateCharacterById = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);  // Ruta actualizada
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el personaje", error);
    throw error;
  }
};

// Eliminar un personaje por ID
export const deleteCharacter = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);  // Ruta correcta
  } catch (error) {
    console.error("Error al eliminar el personaje", error);
    throw error;
  }
};
