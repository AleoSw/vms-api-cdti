const express = require('express');
const router = express.Router();

// Importar los controladores
const authController = require('../controllers/authController');

// Rutas de autenticación
router.post('/register', authController.register); // Registro
router.post('/login', authController.login); // Inicio de sesión
router.post('/logout', authController.logout); // Cerrar sesión

module.exports = router;
