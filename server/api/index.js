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

const FRONTEND = process.env.REACT_APP_FRONTEND_URL;

// Cargamos las variables de entorno desde el archivo .env
dotenv.config();
console.log('Variables de entorno cargadas:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    USE_MEMORY_DB: process.env.USE_MEMORY_DB,
    FRONTEND
});

// Creamos una instancia de la aplicación Express
const app = express();
const PORT = process.env.PORT || 5001; // Usamos el puerto definido en el archivo .env, o 5001 por defecto
let mongoServer; // Variable para almacenar el servidor de MongoDB en memoria

app.use(cors({
    origin: FRONTEND,
    credentials: true
}));
console.log('CORS configurado con origen:', FRONTEND);

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
    store: process.env.NODE_ENV === 'production'
        ? MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: 'sessions'
        })
        : undefined
}));
console.log('Sesión configurada correctamente');

// Configuramos Express para que acepte JSON y formularios codificados
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('Express configurado para JSON y formularios');

// Inicializamos Passport
app.use(passport.initialize());
app.use(passport.session());
console.log('Passport inicializado');

// Función para conectar con la base de datos
const connectDB = async () => {
    console.log('Iniciando conexión a la base de datos...');
    console.log('Estado actual de la conexión:', mongoose.connection.readyState);

    if (mongoose.connection.readyState === 0) { // Solo conecta si no hay una conexión activa
        if (process.env.USE_MEMORY_DB === 'true') {
            console.log('Usando MongoDB en memoria...');
            try {
                mongoServer = await MongoMemoryServer.create();
                const mongoUri = mongoServer.getUri();
                console.log(`MongoDB en memoria iniciado en: ${mongoUri}`);
                await mongoose.connect(mongoUri);
                console.log('Conexión establecida con MongoDB en memoria');
            } catch (error) {
                console.error('Error al iniciar MongoDB en memoria:', error);
                process.exit(1);
            }
        } else {
            const uri = process.env.MONGODB_URI;
            console.log('Intentando conectar a MongoDB Atlas...');
            console.log('URI:', uri);
            try {
                await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
                console.log('Conexión establecida con MongoDB Atlas');
            } catch (error) {
                console.error('Error al conectar a MongoDB Atlas:', error.message);
                console.error('Detalles completos del error:', error);
                process.exit(1);
            }
        }
    } else {
        console.log('Ya existe una conexión activa con la base de datos');
    }
};

// Configuramos las rutas que manejará el servidor
app.use('/api/games', gameRoutes);
console.log('Ruta /api/games configurada');
app.use('/api/auth', authRoutes);
console.log('Ruta /api/auth configurada');
app.use('/api/characters', characterRoutes);
console.log('Ruta /api/characters configurada');
app.use('/api/enemies', enemyRoutes);
console.log('Ruta /api/enemies configurada');
app.use('/api/interaction', interactionRoutes);
console.log('Ruta /api/interaction configurada');
// app.use('/api/turns', turnRoutes); // Ruta para manejar los turnos

// Exporta la app para que Vercel la gestione
module.exports = async (req, res) => {
    // Aquí iniciaremos la conexión a la base de datos solo cuando la función sea llamada
    await connectDB();

    // Maneja las peticiones como si fuera una función serverless
    return app(req, res);
};

// Si este archivo es ejecutado directamente (no importado), iniciamos el servidor
// if (require.main === module && process.env.NODE_ENV !== 'test') {
//     console.log('Archivo ejecutado directamente, iniciando servidor...');
//     startServer();
// } else {
//     console.log('Archivo importado como módulo, no se inicia el servidor automáticamente');
// }
