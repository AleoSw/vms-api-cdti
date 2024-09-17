const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const cameraController = require("../controllers/cameraController")
const sectorController = require("../controllers/sectorController")
const router = express.Router();

// Rutas camara
router.post("/camera/add", authMiddleware, cameraController.addCamera);
router.delete("/camera/remove/:name", authMiddleware, cameraController.removeCamera);
router.get("/camera/all", authMiddleware, cameraController.getCameras);

// Rutas sector
router.get("/sector/all", authMiddleware, sectorController.getSectors);


module.exports = router;
