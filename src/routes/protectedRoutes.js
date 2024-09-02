const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Ruta protegida
router.get('/protected', authMiddleware, (req, res) => {
    res.send('This is a protected route');
});

module.exports = router;
