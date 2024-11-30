//Rutas de personajes
const express = require('express');
const router = express.Router();
const characterController = require('../controllers/characterController');
const { ensureAuthenticated } = require('../controllers/gameController');

// Crear un nuevo personaje
router.post('/', characterController.createCharacter);

// Obtener todos los personajes
router.get('/', characterController.getAllCharacters);

// Obtener los personajes de un usuario específico
router.get('/user/', ensureAuthenticated, characterController.getCharactersByUser);

// Obtener un personaje por ID
router.get('/:id', characterController.getCharacterById);

// Actualizar un personaje por ID
router.put('/:id', characterController.updateCharacterById);

// Eliminar un personaje por ID
router.delete('/:id', characterController.deleteCharacterById);

module.exports = router;
