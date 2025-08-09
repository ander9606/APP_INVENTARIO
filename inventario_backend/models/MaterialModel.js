const { crearMaterial } = require('../controllers/materialController');
const db = require('./db'); // Importa la conexión desde models/db.js

const MaterialModel = {
    // Obtener todos los materiales del inventario

    obtenerTodos: async () => {
        const [resultados] = await db.query('SELECT * FROM materiales');
        return resultados;
    },

    crear: async (nombre) => {
        const [resultado] = await db.query(
            'INSERT INTO materiales (nombre) VALUES (?)',
            [nombre]
        );
        return resultado.insertId;
    }

}

module.exports = MaterialModel;