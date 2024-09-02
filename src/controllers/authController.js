const bcrypt = require('bcrypt'); // Librería para hash de contraseñas
const db = require('../config/db'); // Tu configuración de base de datos
const { generateToken, verifyToken } = require('../utils/jwtUtils'); // Importar funciones de JWT

// Registro de usuario
const register = async (req, res) => {
    const { document, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (document, password) VALUES ($1, $2)', [document, hashedPassword]);
        res.status(201).send('User registered');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
};

// Inicio de sesión
const login = async (req, res) => {
    const { document, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE document = $1', [document]);
        const user = result.rows[0];
        if (user && await bcrypt.compare(password, user.password)) {
            const token = generateToken(user.id);
            res.json({ token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        res.status(500).send('Error logging in');
    }
};


// Cerrar sesión
const logout = (req, res) => {
    res.send('Logged out');
};

module.exports = {
    register,
    login,
    logout
};
