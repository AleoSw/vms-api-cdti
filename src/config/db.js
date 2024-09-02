// src/config/db.js
const { Pool } = require('pg');

// Crear una nueva instancia de Pool y configurarla
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Función para conectar a la base de datos
const connectToDatabase = async () => {
    try {
        await pool.connect();
        console.log('Connected to the PostgreSQL database');
    } catch (err) {
        console.error('Error connecting to the PostgreSQL database', err);
        process.exit(1); // Salir del proceso en caso de error
    }
};

module.exports = {
    connectToDatabase,
    query: (text, params) => pool.query(text, params),
};
