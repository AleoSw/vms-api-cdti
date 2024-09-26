const Sector = require("../models/Sector");
const { getClient } = require("../config/db");

const getSectors = async (req, res) => {
  const client = await getClient();

  try {
    const allSectors = await client.query("SELECT * FROM sectors");

    res.status(200).json({
      sectors: allSectors.rowCount > 0 ? allSectors.rows : []
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

const getSectorsCameras = async (req, res) => {
  const client = await getClient();

  try {
    const allSectorsCameras = await client.query(
      "SELECT s.id AS sector_id, s.name AS sector_name, c.name AS camera_name, c.ip AS camera_ip, c.user_cam, c.password_cam FROM sectors s LEFT JOIN sectors_cameras sc ON s.id = sc.sector_id LEFT JOIN cameras c ON sc.camera_id = c.id;"
    );

    res.status(200).json({
      sectorsCameras: allSectorsCameras.rowCount > 0 ? allSectorsCameras.rows : {},
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
  getSectors,
  getSectorsCameras,
};
