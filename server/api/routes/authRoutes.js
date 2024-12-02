// Rutas de autenticación

const express = require('express');
const passport = require('passport');
const { registerUser, deleteUser } = require('../controllers/userController');
const router = express.Router();
const { ensureAuthenticated } = require('../controllers/gameController');

const FRONT_URL = process.env.REACT_APP_FRONTEND_URL;

// Ruta para registrar un nuevo usuario
router.post('/register', (req, res, next) => {
    console.log('Registro de usuario solicitado. Datos del cuerpo:', req.body);
    next();
}, registerUser);

// Ruta para eliminar un usuario
router.delete('/delete/:id', (req, res, next) => {
    console.log('Eliminación de usuario solicitada para ID:', req.params.id);
    next();
}, deleteUser);

// Ruta para iniciar sesión con Google
router.get('/google', (req, res, next) => {
    console.log('Inicio de sesión con Google solicitado');
    console.log('Cookies actuales:', req.cookies); // Verificar cookies
    next();
}, passport.authenticate('google', {
    scope: ['profile', 'email'], // Solicitamos acceso al perfil y correo electrónico del usuario
    session: true
}));

// Ruta de callback de Google después de la autenticación
router.get('/google/callback', (req, res, next) => {
    console.log('Callback recibido de Google');
    console.log('Headers:', req.headers); // Verificar las cabeceras
    console.log('Cookies recibidas:', req.cookies); // Verificar las cookies
    next();
}, passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }), (req, res) => {
    console.log('Usuario autenticado en callback:', req.user); // Log del usuario autenticado
    console.log('Sesión después de autenticación:', req.session); // Verificar la sesión activa
    res.redirect(FRONT_URL + '/dashboard');
});

// Ruta para obtener datos del usuario autenticado
router.get('/user', ensureAuthenticated, async (req, res) => {
    try {
        console.log('Solicitud a /user recibida');
        console.log('Sesión actual:', req.session);
        console.log('Usuario autenticado:', req.user);

        // Extraer datos del usuario desde req.user (Passport debería haberlo poblado)
        if (req.user) {
            const user = {
                userId: req.user._id,
                displayName: req.user.displayName,
                email: req.user.email,
            };
            res.json(user);
        } else {
            res.status(401).json({ message: 'Usuario no autenticado' });
        }
    } catch (error) {
        console.error('Error obteniendo datos del usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Ruta de éxito de autenticación
router.get('/success', (req, res) => {
    console.log('Solicitud a /success recibida');
    console.log('Usuario autenticado:', req.user);
    if (req.isAuthenticated()) {
        res.status(200).json({ message: 'Inicio de sesión exitoso', authenticated: true, user: req.user });
    } else {
        res.status(401).json({ authenticated: false, message: 'Usuario no autenticado' });
    }
});

// Ruta de fallo de autenticación
router.get('/failure', (req, res) => {
    console.log('Fallo de autenticación detectado');
    res.status(401).json({ message: 'Fallo en la autenticación' });
});

// Ruta para verificar el estado de autenticación del usuario
router.get('/status', (req, res) => {
    console.log('Verificación de estado de autenticación');
    console.log('Usuario autenticado:', req.user);
    if (req.isAuthenticated()) {
        res.json({ isAuthenticated: true, user: req.user });
    } else {
        res.json({ isAuthenticated: false });
    }
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    console.log('Solicitud de cierre de sesión recibida');
    console.log('Sesión antes de cerrar:', req.session);
    req.logout((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
        req.session.destroy(() => {
            console.log('Sesión destruida con éxito');
            res.clearCookie('connect.sid'); // Limpia la cookie de sesión
            console.log('Cookies después de limpiar:', req.cookies);
            res.status(200).json({ message: 'Sesión cerrada con éxito' });
        });
    });
});

module.exports = router;
