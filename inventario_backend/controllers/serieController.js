// Importamos el modelo que maneja las consultas a la base de datos
const SerieModel = require('../models/SerieModel');

// Obtener todas las series asociadas a un elemento
exports.obtenerSeriesPorElemento = async (req, res) => {
  try {
    const { id_elemento } = req.params;
    console.log('🛠 id_elemento recibido en controlador:', id_elemento);
    const series = await SerieModel.obtenerPorElemento(id_elemento);
    console.log('📦 Resultado SQL:', series);
    res.json(series);
  } catch (error) {
    console.error('Error al obtener series:', error);
    res.status(500).json({ error: 'Error al obtener las series del elemento' });
  }
};


// Crear una nueva serie para un elemento
exports.crearSerie = async (req, res) => {
  try {
    const datosSerie = req.body;
    const resultado = await SerieModel.crear(datosSerie);
    res.status(201).json({
      mensaje: 'Serie creada exitosamente',
      id: resultado.insertId
    });
  } catch (error) {
    console.error('Error al crear serie:', error);
    res.status(500).json({ error: 'Error al crear la serie' });
  }
};

// Actualizar una serie por su ID
exports.actualizarSerie = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    await SerieModel.actualizar(id, datosActualizados);
    res.json({ mensaje: 'Serie actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar serie:', error);
    res.status(500).json({ error: 'Error al actualizar la serie' });
  }
};

// Eliminar una serie por su ID
exports.eliminarSerie = async (req, res) => {
  try {
    const { id } = req.params;
    await SerieModel.eliminar(id);
    res.json({ mensaje: 'Serie eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar serie:', error);
    res.status(500).json({ error: 'Error al eliminar la serie' });
  }
};
