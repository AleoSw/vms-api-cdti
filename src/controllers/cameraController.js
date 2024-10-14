const { getClient } = require("../config/db");
const Camera = require("../models/Camera"); // Asegúrate de que la ruta sea correcta
const Sector = require("../models/Sector"); // Asegúrate de que la ruta sea correcta

const getCameraByName = async (req, res) => {
  const { name } = req.params;
  const client = await getClient();

  try {
    const cameraResult = await client.query(
      "SELECT c.*, s.name AS sector_name FROM cameras c JOIN sectors_cameras sc ON c.id = sc.camera_id JOIN sectors s ON sc.sector_id = s.id WHERE c.name = $1",
      [name]
    );

    if (cameraResult.rowCount === 0) {
      throw new Error("Camera not found");
    }

    return res.status(200).json({
      camera: cameraResult.rows
    })
  } catch (error) {
    return res.status(404).json({
      error: error.message
    })
  } finally {
    client.release();
  }
};

const updateCamera = async (req, res) => {
  const { prevName } = req.params; // Nombre de la cámara para buscarla
  const { name, ip, user_cam, password_cam, sector_name } = req.body; // Nuevos datos para actualizar
  const client = await getClient();

  try {
    await client.query("BEGIN");

    const cameraIdResult = await client.query(
      "SELECT id FROM cameras WHERE name = $1",
      [prevName]
    )    
    console.log(prevName);
    
    const cameraId = cameraIdResult.rows[0].id;

    // Actualiza la información de la cámara y obtiene la ID de la cámara
    const updateCameraQuery = `
      UPDATE cameras
      SET 
        name = $1,
        ip = $2,
        user_cam = $3,
        password_cam = $4
      WHERE name = $5
    `;

    const cameraResult = await client.query(updateCameraQuery, [name, ip, user_cam, password_cam, prevName]);
    
    // Consultar el ID del sector a partir del nombre
    const sectorIdResult = await client.query(`
      SELECT id FROM sectors WHERE name = $1
    `, [sector_name]);

    // Verificar si se encontró el sector
    if (sectorIdResult.rows.length > 0) {
      const sectorId = sectorIdResult.rows[0].id;

      // Actualizar la relación en sectors_cameras usando la ID de la cámara
      await client.query(`
        UPDATE sectors_cameras 
        SET sector_id = $1 
        WHERE camera_id = $2
      `, [sectorId, cameraId]);

    } else {
      console.error(`Sector con nombre '${sector_name}' no encontrado.`);
      await client.query("ROLLBACK");
      return res.status(404).json({ message: `Sector '${sector_name}' no encontrado.` });
    }

    await client.query("COMMIT");
    res.status(200).json({ message: "Cámara actualizada exitosamente.", cameraName: name });
  } catch (error) {
    console.error("Error al actualizar la cámara:", error);
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Error al actualizar la cámara." });
  } finally {
    client.release();
  }
}


const getCameraByIp = async (req, res) => {
  const { ip } = req.params;
  const client = await getClient();

  try {
    const cameraResult = await client.query(
      "SELECT * FROM cameras WHERE ip = $1",
      [ip]
    );

    if (cameraResult.rowCount === 0) {
      throw new Error("Camera not found");
    }

    return res.status(200).json({
      camera: cameraResult.rows
    })
  } catch (error) {
    return res.status(404).json({
      error: error.message
    })
  } finally {
    client.release();
  }
};

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
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(409).json({
      message: "Error adding a new camera",
      error: error.message,
      errorCode: error.code,
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
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(error.message === "Camera not found" ? 404 : 500).json({
      message:
        error.message === "Camera not found"
          ? "Camera not found"
          : "Error removing camera",
    });
  } finally {
    client.release();
  }
};

const getCameras = async (req, res) => {
  const client = await getClient();

  try {
    const allCameras = await client.query(`SELECT c.*, s.name AS sector_name FROM cameras c JOIN sectors_cameras sc ON c.id = sc.camera_id JOIN sectors s ON sc.sector_id = s.id`);

    res.status(200).json({
      cameras: allCameras.rowCount > 0 ? allCameras.rows : [],
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching cameras",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = {
  addCamera,
  removeCamera,
  getCameras,
  getCameraByName,
  getCameraByIp,
  updateCamera
};
