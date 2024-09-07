const express = require('express');
const router = express.Router();

// Importar los controladores
const authController = require('../controllers/authController');

// Rutas de autenticación
router.post('/register', authController.register); // Registro
router.post('/login', authController.login); // Inicio de sesión
module.exports = router;
