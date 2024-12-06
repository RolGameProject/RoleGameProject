// src/services/enemyService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api/enemies/';  

// Obtener todos los enemigos
export const getAllEnemies = async () => {
  try {
    const response = await axios.get(API_URL);  // Esto ya está correcto
    return response.data;
  } catch (error) {
    console.error("Error al obtener los enemigos", error);
    throw error;
  }
};

// Crear un nuevo enemigo
export const createEnemy = async (enemyData) => {
  try {
    const response = await axios.post(API_URL, enemyData);  // Esto también es correcto
    return response.data;
  } catch (error) {
    console.error("Error al crear el enemigo", error);
    throw error;
  }
};

// Obtener un enemigo por ID
export const getEnemyById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);  // Ruta correcta
    return response.data;
  } catch (error) {
    console.error("Error al obtener el enemigo", error);
    throw error;
  }
};

// Actualizar un enemigo por ID
export const updateEnemy = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);  // Ruta correcta
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el enemigo", error);
    throw error;
  }
};

// Eliminar un enemigo por ID
export const deleteEnemy = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);  // Ruta correcta
  } catch (error) {
    console.error("Error al eliminar el enemigo", error);
    throw error;
  }
};
