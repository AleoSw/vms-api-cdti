const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const settingsControllers = require("../controllers/settingsController")
const router = express.Router();
const { getClient } = require("../config/db");

// Ruta protegida
router.post("/camera/add", authMiddleware, settingsControllers.addCamera);
router.delete("/camera/remove/:name", authMiddleware, settingsControllers.removeCamera);
router.get("/camera/all", authMiddleware, settingsControllers.getCameras);


module.exports = router;
