const User = require('../models/User'); // Importar la clase User

// Registro de usuario
const register = async (req, res) => {
    const { document, password } = req.body;
    try {
        const message = await User.create(document, password);
        res.status(201).send(message);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Inicio de sesión
const login = async (req, res) => {
    const { document, password } = req.body;
    try {
        const result = await User.login(document, password);
        res.json(result);
    } catch (error) {
        res.status(401).send(error.message);
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
