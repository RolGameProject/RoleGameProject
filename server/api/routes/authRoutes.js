// Rutas de autenticación

const express = require('express');
const passport = require('passport');
const { registerUser, deleteUser } = require('../controllers/userController');
const router = express.Router();
const { ensureAuthenticated } = require('../controllers/gameController');

const FRONT_URL=process.env.REACT_APP_FRONTEND_URL;
// Ruta para registrar un nuevo usuario
router.post('/register', registerUser);

// Ruta para eliminar un usuario
router.delete('/delete/:id', deleteUser); // Aseguramos que el ID del usuario se pase como parámetro en la URL

// Ruta para iniciar sesión con Google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'], // Solicitamos acceso al perfil y correo electrónico del usuario
    session: true
}));

// Ruta de callback de Google después de la autenticación
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }),
    (req, res) => {
        // Redirige al front-end tras la autenticación exitosa
        res.redirect(FRONT_URL +'/dashboard');
    }
);

router.get('/user', ensureAuthenticated, (req, res) => {
    console.log('Cookie recibida', req.headers.cookie);
    console.log('Sesión actual:', req.session);  // Muestra la sesión
    console.log('Usuario autenticado:', req.user);  // Muestra el objeto del usuario
    if (req.user) {
        // Devuelve la información del usuario autenticado
        res.json({
            userId: req.user._id,
            displayName: req.user.displayName,
            email: req.user.email
        });
    } else {
        res.status(401).json({ message: 'Usuario no autenticado' });
    }
});

// Ruta de éxito de autenticación
router.get('/success', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({ message: 'Inicio de sesión exitoso', authenticated: true, user: req.user });
    } else {
        res.status(401).json({ authenticated: false, message: 'Usuario no autenticado' });
    }
});

// Ruta de fallo de autenticación
router.get('/failure', (req, res) => {
    res.status(401).json({ message: 'Fallo en la autenticación' });
});

// Ruta para verificar si el usuario está autenticado
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ isAuthenticated: true, user: req.user }); // Devuelve true si está autenticado
    } else {
        res.json({ isAuthenticated: false }); // Devuelve false si no lo está
    }
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
        // Destruir la sesión y limpiar la cookie
        req.session.destroy(() => {
            res.clearCookie('connect.sid'); // Limpia la cookie de sesión
            res.status(200).json({ message: 'Sesión cerrada con éxito' });
        });
    });
});


module.exports = router;
