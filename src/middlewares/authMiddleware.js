const { verifyToken } = require('../utils/jwtUtils'); // Importar la función de verificación de JWT

const authMiddleware = (req, res, next) => {
    // Obtener el token del encabezado Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).send('Authorization header is missing');
    }
    
    // Extraer el token del encabezado
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).send('Token is missing');
    }
    
    try {
        // Verificar el token
        const decoded = verifyToken(token);
        req.user = decoded; // Agregar la información del usuario decodificada al objeto req
        next(); // Pasar al siguiente middleware o controlador
    } catch (error) {
        res.status(401).send('Invalid or expired token');
    }
};

module.exports = authMiddleware;
