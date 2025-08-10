const ElementoModel = require('../models/ElementoModel');

// Obtener todos los elementos del inventario
exports.obtenerElementos = async (req, res) => {
  try {
    const elementos = await ElementoModel.obtenerTodos();
    res.json(elementos);
  } catch (error) {
  console.error('Error al guardar:', error.message, error.stack);
  res.status(500).json({ error: 'Error al guardar', detalle: error.message });
}

};

// crear un nuevo elemento

exports.crearElemento = async (req, res) => {
  const {
    nombre,
    descripcion,
    categoria_id,
    material_id,
    unidad_id,
    cantidad,
    lleva_serie,
    estado = 'bueno',
    ubicacion,
    series = []
  } = req.body;

  console.log(`📨 Recibido en backend: ${JSON.stringify(req.body)} `);

  if (lleva_serie && series.length !== cantidad) {
    return res.status(400).json({
      error: `La cantidad (${cantidad}) no coincide con la cantidad de series (${series.length})`
    });
  }


  try {
    const resultado = await ElementoModel.crear({
      nombre,
      descripcion,
      cantidad,
      requiere_series: lleva_serie ? 1 : 0,
      categoria_id,
      material_id,
      unidad_id,
      estado,
      ubicacion: lleva_serie ? null : ubicacion // Solo asignar ubicación si no lleva serie
    });

    const elementoId = resultado.insertId;
    console.log(`✅ Elemento creado con ID: ${elementoId}`);
  } catch (error) {
    console.error('❌ Error al insertar en elementos:', error.message || error);
    return res.status(500).json({ error: 'Error al insertar en elementos', detalle: error.message });
  }


  if (lleva_serie && series.length > 0) {
    try {
      // Agregar fecha_ingreso y estado por defecto a cada serie
      const seriesConFechaYUbicacion = series.map(s => ({
        numero_serie: s.numero_serie,
        estado: s.estado || 'nuevo',
        fecha_ingreso: new Date(),
        ubicacion: s.ubicacion || null
      }));

      console.log('📦 Insertando series:', JSON.stringify(seriesConFechaYUbicacion, null, 2));
      //await ElementoModel.crearSeriesPorElemento(elementoId, seriesConFechaYUbicacion); para pruebas
      await ElementoModel.crearSeriesPorElemento(elementoId, seriesConFechaYUbicacion);

      res.status(201).json({
        mensaje: `Elemento creado exitosamente con ID: ${elementoId}`,
        id: elementoId
      });
    } catch (error) {
      console.error('❌ Error al insertar series:', error.message || error);
      return res.status(500).json({ error: 'Error al insertar series', detalle: error.message });
    }
    return; // Prevents sending multiple responses
  }

  res.status(201).json({
    mensaje: `Elemento creado exitosamente con ID: ${elementoId}`,
    id: elementoId
  });
};


// Actualizar un elemento por ID
exports.actualizarElemento = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    const resultado = await ElementoModel.actualizar(id, datosActualizados);
    res.json({ mensaje: 'Elemento actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar elemento:', error);
    res.status(500).json({ error: 'Error al actualizar el elemento' });
  }
};

// Eliminar un elemento por ID
exports.eliminarElemento = async (req, res) => {
  try {
    const { id } = req.params;
    await ElementoModel.eliminar(id);
    res.json({ mensaje: 'Elemento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar elemento:', error);
    res.status(500).json({ error: 'Error al eliminar el elemento' });
  }
};

// detalle de elemento + series

exports.detalleElemento = async (req, res) => {
  const { id } = req.params;

  const queryElemento = 'SELECT * FROM elementos WHERE id = ?';
  const querySeries = 'SELECT * FROM series WHERE id_elemento = ?';

  db.query(queryElemento, [id], (err, elementos) => {
    if (err) return res.status(500).json({ error: 'Error al obtener el elemento' });
    if (elementos.length === 0) return res.status(404).json({ error: 'Elemento no encontrado' });

    const elemento = elementos[0];

    if (elemento.requiere_series){
      db.query(querySeries, [id], (err, series) => {
        if (err) return res.status(500).json({ error: 'Error al obtener las series' });
        res.json({ ...elemento, series });
      });
    }else {
      res.json(elemento)
    }
  });  
};