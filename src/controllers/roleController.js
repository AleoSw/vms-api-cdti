const { getClient } = require("../config/db")

const getRoles = async (req, res) => {
    const client = await getClient();

    try {
        const rolesResult = await client.query(
            "SELECT * FROM roles"
        )

        return res.status(200).json({
            roles: (rolesResult.rowCount > 0 ? rolesResult.rows : {})
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching roles",
            error: error.message
        })
    } finally {
        client.release();
    }
}

module.exports = {
    getRoles
}