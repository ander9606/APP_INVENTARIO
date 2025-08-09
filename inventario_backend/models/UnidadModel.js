const db = require('./db'); // Importa la conexión desde models/db.js


const UnidadModel = {
    // Obtener todas las unidades del inventario
    obtenerTodos: async () => {
      const [resultados] = await db.query('SELECT * FROM unidades');
      return resultados;
    },

    // Crear una nueva unidad
    crear: async ({ nombre, abreviatura, tipo }) => {
        const [resultado] = await db.query(
            'INSERT INTO unidades (nombre, abreviatura, tipo) VALUES (?, ?, ?)',
            [nombre, abreviatura, tipo]
        );
        return resultado.insertId;
    }
};

module.exports = UnidadModel;