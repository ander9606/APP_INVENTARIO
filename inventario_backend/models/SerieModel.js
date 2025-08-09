// models/SerieModel.js
const db = require('./db');

const SerieModel = {
  // Obtener todas las series de un elemento
  obtenerPorElemento: async (idElemento) => {
    const [filas] = await db.query(
      'SELECT * FROM series WHERE id_elemento = ?',
      [idElemento]
    );
    return filas;
  },

  // Crear una nueva serie
  crear: async ({ id_elemento, numero_serie, estado, fecha_ingreso }) => {
    const [resultado] = await db.query(
      'INSERT INTO series (id_elemento, numero_serie, estado, fecha_ingreso) VALUES (?, ?, ?, ?)',
      [id_elemento, numero_serie, estado, fecha_ingreso]
    );
    return resultado;
  },

  // Actualizar una serie por ID
  actualizar: async (id, { numero_serie, estado, fecha_ingreso }) => {
    const [resultado] = await db.query(
      'UPDATE series SET numero_serie = ?, estado = ?, fecha_ingreso = ? WHERE id = ?',
      [numero_serie, estado, fecha_ingreso, id]
    );
    return resultado;
  },

  // Eliminar una serie por ID
  eliminar: async (id) => {
    await db.query('DELETE FROM series WHERE id = ?', [id]);
  }
};

module.exports = SerieModel;
