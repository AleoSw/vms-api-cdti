const jwt = require('jsonwebtoken');

// Generar un token JWT
const generateToken = (document) => {
    return jwt.sign({ document }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Verificar un token JWT
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    generateToken,
    verifyToken
};
