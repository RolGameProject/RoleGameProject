// Archivo de configuración BACKEND principal
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
const gameRoutes = require('./routes/gameRoutes');
const enemyRoutes = require('./routes/enemyRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
// const turnRoutes = require('./routes/turnRoutes');
const passport = require('passport');
require('./config/passportConfig');
const authRoutes = require('./routes/authRoutes');
const characterRoutes = require('./routes/characterRoutes');

const FRONTEND=process.env.REACT_APP_FRONTEND_URL;

// Cargamos las variables de entorno desde el archivo .env
dotenv.config();

// Creamos una instancia de la aplicación Express
const app = express();
const PORT = process.env.PORT || 5001; // Usamos el puerto definido en el archivo .env, o 5001 por defecto
let mongoServer; // Variable para almacenar el servidor de MongoDB en memoria

app.use(cors({
    origin: FRONTEND,
    credentials: true
}));

// Configurar sesión para almacenar la sesión del usuario
app.use(session({
    secret: process.env.SESSION_SECRET || 'mi_secreto_super_seguro', 
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', 
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hora de duración
      sameSite: 'lax' 
    },
    store: process.env.NODE_ENV === 'production' // Si estamos en producción, usar MongoStore para persistir la sesión en MongoDB
        ? MongoStore.create({
            mongoUrl: process.env.MONGODB_URI, // URI de MongoDB (en producción se conecta a MongoDB Atlas)
            collectionName: 'sessions' // Nombre de la colección para las sesiones
        })
        : undefined // En desarrollo no usamos MongoStore, la sesión se maneja en memoria
  }));

// Configuramos Express para que acepte JSON y formularios codificados
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializamos Passport
app.use(passport.initialize());
app.use(passport.session());

// Función para conectar con la base de datos
const connectDB = async () => {
    if (mongoose.connection.readyState === 0) { // Solo conecta si no hay una conexión activa
        // Si estamos usando MongoDB en memoria para desarrollo
        if (process.env.USE_MEMORY_DB === 'true') {
            mongoServer = await MongoMemoryServer.create(); // Iniciamos el servidor en memoria
            const mongoUri = mongoServer.getUri(); // Obtenemos la URI del servidor en memoria
            await mongoose.connect(mongoUri); // Conectamos mongoose a esa URI
            console.log('Conectado a MongoDB en memoria');
        } else {
            // Si no, usamos MongoDB Atlas con la URI definida en las variables de entorno
            const uri = process.env.MONGODB_URI;
            try {
                // Intentamos conectarnos a MongoDB Atlas
                await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                console.log('Conectado a MongoDB Atlas');
            } catch (error) {
                // Si ocurre un error, lo mostramos y cerramos el proceso
                console.error('Error al conectar a MongoDB Atlas:', error);
                process.exit(1);
            }
        }
    } else {
        console.log('Conexión ya establecida con la base de datos');
    }
};

// Configuramos las rutas que manejará el servidor
app.use('/api/games', gameRoutes); // Ruta para manejar las partidas
app.use('/api/auth', authRoutes); // Ruta para manejar la autenticación
app.use('/api/characters', characterRoutes); // Ruta para manejar personajes
app.use('/api/enemies', enemyRoutes); // Ruta para manejar enemigos
app.use('/api/interaction', interactionRoutes); // Ruta para manejar interacciones
// app.use('/api/turns', turnRoutes); // Ruta para manejar los turnos

// Función para iniciar el servidor
const startServer = async () => {
    // Conectamos a la base de datos antes de iniciar el servidor
    await connectDB();

    // Iniciamos el servidor en el puerto definido
    const server = app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });

    // Función para cerrar el servidor y la conexión con la base de datos
    const shutdown = async () => {
        if (mongoServer) await mongoServer.stop(); // Detenemos el servidor de MongoDB en memoria
        await mongoose.connection.close(); // Cerramos la conexión con MongoDB
        server.close(); // Cerramos el servidor Express
    };

    // Configuramos el servidor para que cierre correctamente al recibir señales de terminación
    process.on('SIGINT', shutdown); // Para el proceso cuando se interrumpe
    process.on('SIGTERM', shutdown); // Para el proceso cuando se termina de manera limpia
};

module.exports = app;

// Si este archivo es ejecutado directamente (no importado), iniciamos el servidor
if (require.main === module && process.env.NODE_ENV !== 'test') {
    startServer(); // Iniciamos el servidor
}
