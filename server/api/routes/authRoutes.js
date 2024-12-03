// Rutas de autenticación

const express = require('express');
const passport = require('passport');
const { registerUser, deleteUser } = require('../controllers/userController');
const router = express.Router();
const { ensureAuthenticated } = require('../controllers/gameController');
const User = require('../models/userModel');

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

const cookieOptions = {
    httpOnly: true, // Las cookies no se pueden acceder desde el cliente mediante JavaScript
    secure: process.env.NODE_ENV === 'production', // Cookies solo se envían por HTTPS en producción
    sameSite: 'None', // Permitir cross-origin cookies (importante para Vercel)
    maxAge: 24 * 60 * 60 * 1000 // Expiración de la cookie: 1 día
};

// Ruta de callback de Google después de la autenticación
// router.get('/google/callback', (req, res, next) => {
//     console.log('Callback recibido de Google');
//     console.log('Headers:', req.headers); // Verificar las cabeceras
//     console.log('Cookies recibidas:', req.cookies); // Verificar las cookies
//     next();
// }, passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }), (req, res) => {
//     console.log('Usuario autenticado en callback:', req.user); // Log del usuario autenticado
//     console.log('Sesión después de autenticación:', req.session); // Verificar la sesión activa
//     res.redirect(FRONT_URL + '/dashboard');
// });

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }), 
    (req, res) => {
        if (!req.user) {
            return res.status(401).send('Error: Usuario no autenticado');
        }

        console.log('Usuario autenticado en callback:', req.user);

        // Guardar datos del usuario en una cookie
        const userData = {
            id: req.user._id,
            displayName: req.user.displayName,
            email: req.user.email,
        };

        console.log('userData en authRoutes callback:', req.user._id);
        console.log('userData en authRoutes callback:', req.user.displayName);
        console.log('userData en authRoutes callback:', req.user.email);
        
        res.cookie('user', JSON.stringify(userData), cookieOptions);

        console.log('res.cookies en callback: ', res.cookie);

        // Redirigir al frontend
        res.redirect(FRONT_URL + '/dashboard');
    }
);

// Middleware para verificar cookies
const verifyCookie = (req, res, next) => {
    const userCookie = req.cookies.user;
    if (!userCookie) {
        return res.status(401).json({ authenticated: false, message: 'Usuario no autenticado' });
    }

    try {
        req.user = JSON.parse(userCookie); // Parsear la cookie y asignarla al objeto req
        next();
    } catch (err) {
        console.error('Error al parsear la cookie:', err);
        res.status(401).json({ authenticated: false, message: 'Cookie inválida' });
    }
};


// Ruta para obtener datos del usuario autenticado
// router.get('/user', (req, res) => {
//     console.log('req en auth/user: ',req.isAuthenticated());
//     if (req.isAuthenticated()) {
//         res.status(200).json(req.user);  // Devuelve el usuario si está autenticado
//     } else {
//         res.status(401).json({ message: 'No autenticado' });  // Si no está autenticado, devuelve 401
//     }
// });

// router.get('/user', ensureAuthenticated, async (req, res) => {
//     try {
//         console.log('Solicitud a /user recibida');
//         console.log('Sesión actual:', req.session);
//         console.log('Usuario autenticado:', req.user);

//         // Extraer datos del usuario desde req.user (Passport debería haberlo poblado)
//         if (req.user) {
//             const user = {
//                 userId: req.user._id,
//                 displayName: req.user.displayName,
//                 email: req.user.email,
//             };
//             res.json(user);
//         } else {
//             res.status(401).json({ message: 'Usuario no autenticado' });
//         }
//     } catch (error) {
//         console.error('Error obteniendo datos del usuario:', error);
//         res.status(500).json({ message: 'Error del servidor' });
//     }
// });

// Ruta para obtener datos del usuario autenticado
router.get('/user', verifyCookie, (req, res) => {
    console.log('Usuario autenticado desde cookie:', req.user);
    res.status(200).json(req.user); // Devolver los datos del usuario desde la cookie
});

router.get('/success', verifyCookie, (req, res) => {
    res.status(200).json({ message: 'Inicio de sesión exitoso', authenticated: true, user: req.user });
});

// Ruta de éxito de autenticación
// router.get('/success', (req, res) => {
//     console.log('Solicitud a /success recibida');
//     console.log('Usuario autenticado:', req.user);
//     console.log('Req en success: ', req);
//     if (req.isAuthenticated()) {
//         res.status(200).json({ message: 'Inicio de sesión exitoso', authenticated: true, user: req.user });
//     } else {
//         res.status(401).json({ authenticated: false, message: 'Usuario no autenticado' });
//     }
// });

// Ruta de fallo de autenticación
router.get('/failure', (req, res) => {
    console.log('Fallo de autenticación detectado');
    res.status(401).json({ message: 'Fallo en la autenticación' });
});

// Ruta para verificar el estado de autenticación del usuario

router.get('/status', async (req, res) => {
    console.log('Verificación de estado de autenticación basada en cookies...');
    
    const userCookie = req.cookies.user;

    if (!userCookie) {
        console.log('No se encontró la cookie de usuario.');
        return res.json({ isAuthenticated: false });
    }

    try {
        // Decodificar y parsear la cookie
        const decodedUser = JSON.parse(decodeURIComponent(userCookie));
        console.log('Usuario decodificado desde la cookie:', decodedUser);

        // Validar si existe el ID del usuario
        if (!decodedUser.id) {
            console.log('Cookie inválida: no contiene ID de usuario.');
            return res.json({ isAuthenticated: false });
        }

        // Consultar en la base de datos para verificar la existencia del usuario
        const user = await User.findById(decodedUser.id);
        if (!user) {
            console.log('Usuario no encontrado en la base de datos.');
            return res.json({ isAuthenticated: false });
        }

        console.log('Usuario autenticado:', user);
        res.json({ isAuthenticated: true, user });
    } catch (error) {
        console.error('Error al procesar la cookie de usuario:', error);
        res.json({ isAuthenticated: false });
    }
});

// router.get('/status', (req, res) => {
//     console.log('Verificación de estado de autenticación');
//     console.log('Usuario autenticado:', req.user);
//     if (req.isAuthenticated()) {
//         res.json({ isAuthenticated: true, user: req.user });
//     } else {
//         res.json({ isAuthenticated: false });
//     }
// });

router.get('/logout', (req, res) => {
    console.log('Solicitud de cierre de sesión recibida');
    res.clearCookie('user', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
    });
    res.status(200).json({ message: 'Sesión cerrada con éxito' });
});

// Ruta para cerrar sesión
// router.get('/logout', (req, res) => {
//     console.log('Solicitud de cierre de sesión recibida');
//     console.log('Sesión antes de cerrar:', req.session);
//     req.logout((err) => {
//         if (err) {
//             console.error('Error al cerrar sesión:', err);
//             return res.status(500).json({ message: 'Error al cerrar sesión' });
//         }
//         req.session.destroy(() => {
//             console.log('Sesión destruida con éxito');
//             res.clearCookie('connect.sid'); // Limpia la cookie de sesión
//             console.log('Cookies después de limpiar:', req.cookies);
//             res.status(200).json({ message: 'Sesión cerrada con éxito' });
//         });
//     });
// });

module.exports = router;
