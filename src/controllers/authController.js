const bcrypt = require("bcrypt"); // Librería para hash de contraseñas
const { generateToken, verifyToken } = require("../utils/jwtUtils"); // Importar funciones de JWT
const { getClient } = require("../config/db.js");
// Registro de usuario
const register = async (req, res) => {
  const { document, password } = req.body;
  const client = await getClient();

  try {
    await client.query("BEGIN");

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      "INSERT INTO users (document, password) VALUES ($1, $2) RETURNING id",
      [document, hashedPassword]
    );

    const userId = await userResult.rows[0].id;

    await client.query(
        'INSERT INTO users_roles (user_id, role_id) VALUES ($1, $2)',
        [userId, 2]
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
      res.json({ token });
  
    } catch (error) {
      // Maneja los errores, incluyendo el caso de credenciales inválidas
      res.status(error.message === "Invalid credentials" ? 401 : 500).json({
        message: error.message === "Invalid credentials" ? "Invalid credentials" : error.message,
      });
    }
  };
  

// Cerrar sesión
const logout = (req, res) => {
  res.send("Logged out");
};

module.exports = {
  register,
  login,
  logout,
};
