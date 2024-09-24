const express = require('express');
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

// Importar los controladores
const authController = require('../controllers/authController');

// Rutas de autenticación
router.post('/register', authMiddleware, authController.register); // Registro
router.post('/login', authController.login); // Inicio de sesión
router.get('/user', authMiddleware, authController.getUser);

module.exports = router;
