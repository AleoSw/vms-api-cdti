const { getClient } = require("../config/db");
const Camera = require('../models/Camera'); // Asegúrate de que la ruta sea correcta
const Sector = require('../models/Sector'); // Asegúrate de que la ruta sea correcta

const addCamera = async (req, res) => {
  const { name, ip, user_cam, password_cam, sector_name } = req.body;
  const client = await getClient();

  try {
    await client.query("BEGIN");

    // Crear una instancia de la clase Camera
    const camera = new Camera(null, name, ip, user_cam, password_cam);

    // Insertar la cámara en la base de datos
    const cameraResult = await client.query(
      "INSERT INTO cameras (name, ip, user_cam, password_cam) VALUES ($1, $2, $3, $4) RETURNING id",
      [camera.name, camera.ip, camera.userCam, camera.passwordCam]
    );

    const cameraId = cameraResult.rows[0].id;

    // Crear una instancia de la clase Sector y obtener el sector ID
    const sectorResult = await client.query(
      "SELECT id FROM sectors WHERE name = $1",
      [sector_name]
    );

    if (sectorResult.rowCount === 0) {
      throw new Error("Sector not found");
    }

    const sector = new Sector(sectorResult.rows[0].id, sector_name);

    // Relacionar la cámara con el sector
    await client.query(
      "INSERT INTO sectors_cameras (sector_id, camera_id) VALUES ($1, $2)",
      [sector.id, cameraId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Camera added successfully",
      sector: sector.name,
      cameraName: camera.name,
      ok: true,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      message: "Error adding a new camera",
      error: error.message,
      errorCode: error.code,
      ok: false,
    });
  } finally {
    client.release();
  }
};

const removeCamera = async (req, res) => {
  const cameraName = req.params.name;
  const client = await getClient();

  try {
    await client.query("BEGIN");

    // Consultar si la cámara existe
    const cameraResult = await client.query(
      "SELECT id FROM cameras WHERE name = $1",
      [cameraName]
    );

    if (cameraResult.rowCount === 0) throw new Error("Camera not found");

    const cameraId = cameraResult.rows[0].id;

    // Eliminar la cámara y su relación con sectores
    await client.query("DELETE FROM cameras WHERE id = $1", [cameraId]);
    await client.query("DELETE FROM sectors_cameras WHERE camera_id = $1", [
      cameraId,
    ]);

    await client.query("COMMIT");

    res.status(200).json({
      message: "Camera removed successfully",
      removedCamera: cameraName,
      ok: true,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(error.message === "Camera not found" ? 404 : 500).json({
      message:
        error.message === "Camera not found"
          ? "Camera not found"
          : "Error removing camera",
      ok: false,
    });
  } finally {
    client.release();
  }
};

const getCameras = async (req, res) => {
  const client = await getClient();

  try {
    const allCameras = await client.query(
      `SELECT s.name AS sector_name, c.name AS camera_name
       FROM cameras c
       JOIN sectors_cameras sc ON c.id = sc.camera_id
       JOIN sectors s ON sc.sector_id = s.id;`
    );

    res.status(200).json({
      ok: true,
      cameras: (allCameras.rowCount > 0 ? allCameras.rows : {}),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching cameras",
      error: error.message,
      ok: false,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  addCamera,
  removeCamera,
  getCameras,
};
