const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const cameraController = require("../controllers/cameraController")
const sectorController = require("../controllers/sectorController")
const roleController = require("../controllers/roleController")
const router = express.Router();

// Rutas camara
router.post("/camera/add", authMiddleware, cameraController.addCamera);
router.delete("/camera/remove/:name", authMiddleware, cameraController.removeCamera);
router.get("/camera/all", authMiddleware, cameraController.getCameras);

// Rutas sector
router.get("/sector/all", authMiddleware, sectorController.getSectors);
router.get("/sector/cameras", authMiddleware, sectorController.getSectorsCameras);

//Rutas roles
router.get("/role/all", authMiddleware, roleController.getRoles);


module.exports = router;
