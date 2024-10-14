const bcrypt = require("bcrypt"); // Librería para hash de contraseñas
const { generateToken, verifyToken } = require("../utils/jwtUtils"); // Importar funciones de JWT
const { getClient } = require("../config/db.js");
// Registro de usuario
const register = async (req, res) => {
  const { document, password, rol_name } = req.body;
  const client = await getClient();

  try {
    await client.query("BEGIN");

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      "INSERT INTO users (document, password) VALUES ($1, $2) RETURNING id",
      [document, hashedPassword]
    );

    const userId = userResult.rows[0].id;

    const roleResult = await client.query(
      'SELECT id FROM roles WHERE name = $1',
      [rol_name]
    );

    const roleId = roleResult.rows[0].id

    await client.query(
      'INSERT INTO users_roles (user_id, role_id) VALUES ($1, $2)',
      [userId, roleId]
    )

    await client.query('COMMIT');

    res.status(201).json({
      message: "User created successfully",
      userCreated: document,
      rol: "Monitor",
    })
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({
      message: "Error creating a new user",
      error: error.message,
      errorCode: error.code,
    })
  } finally {
    await client.release()
  }
};

// Inicio de sesión
const login = async (req, res) => {
  const { document, password } = req.body;
  const client = await getClient();

  try {
    const result = await client.query("SELECT * FROM users WHERE document = $1", [document]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Lanza un error si las credenciales son inválidas
      throw new Error("Invalid credentials");
    }

    const token = `Bearer ${generateToken(user.document)}`;
    res.status(200).json({ token });

  } catch (error) {
    // Maneja los errores, incluyendo el caso de credenciales inválidas
    res.status(error.message === "Invalid credentials" ? 401 : 500).json({
      message: error.message === "Invalid credentials" ? "Invalid credentials" : error.message,
    });
  } finally {
    client.release();
  }
};


// Cerrar sesión
const logout = (req, res) => {
  res.send("Logged out");
};

const getUser = async (req, res) => {
  // Extraer el token del encabezado
  const token = req.headers.authorization.split(' ')[1];

  // Verificar si el token está presente
  if (!token) {
    return res.status(401).json({
      error: "Token is missing",
    });
  }
  
  const client = await getClient();

  try {
    const decoded = verifyToken(token);

    const userResult = await client.query(
      "SELECT u.id, u.document, r.name AS role_name FROM users u JOIN users_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id WHERE document = $1",
      [decoded.document]
    )

    return res.json({
      user: userResult.rowCount > 0 ? userResult.rows[0] : []
    });
  } catch (error) {
    return res.status(401).json({
      error: "Token is invalid or expired"
    });
  } finally {
    client.release();
  }
};

const getUsers = async (req, res) => {
  const client = await getClient();
  try {

    const usersResult = await client.query(
      "SELECT u.id, u.document, u.password, r.name AS role_name FROM users u JOIN users_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id"
    )

    return res.json({
      users: usersResult.rowCount > 0 ? usersResult.rows : []
    });

  } catch (error) {
    return res.status(401).json({
      error: "Token is invalid or expired"
    });
  } finally {
    client.release();
  }
}

module.exports = {
  register,
  login,
  logout,
  getUser,
  getUsers
};
