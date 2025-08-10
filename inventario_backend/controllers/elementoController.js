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

  // ✅ Validación: si lleva serie, la cantidad debe coincidir con el número de series enviadas
  if (lleva_serie && series.length !== cantidad) {
    return res.status(400).json({
      error: `La cantidad (${cantidad}) no coincide con la cantidad de series (${series.length})`
    });
  }

  let elemento_id; // ✅ Definimos fuera del try para poder usarlo más abajo

  try {
    // 📌 Insertar elemento
    const resultado = await ElementoModel.crear({
      nombre,
      descripcion,
      cantidad,
      requiere_series: lleva_serie ? 1 : 0,
      categoria_id,
      material_id,
      unidad_id,
      estado,
      ubicacion: lleva_serie ? null : ubicacion // Si lleva serie, no asignamos ubicación aquí
    });

    elemento_id = resultado.insertId; // ✅ Guardamos el insertId en la variable definida antes
    console.log(`✅ Elemento creado con ID: ${elemento_id}`);
  } catch (error) {
    console.error('❌ Error al insertar en elementos:', error.message || error);
    return res.status(500).json({ error: 'Error al insertar en elementos', detalle: error.message });
  }

  // 📌 Si lleva serie, insertar series
  if (lleva_serie && series.length > 0) {
    try {
      const seriesConFechaYUbicacion = series.map(s => ({
        numero_serie: s.numero_serie,
        estado: s.estado || 'nuevo',
        fecha_ingreso: new Date(), // ✅ Fecha automática
        ubicacion: s.ubicacion || null
      }));

      console.log('📦 Insertando series:', JSON.stringify(seriesConFechaYUbicacion, null, 2));

      // ✅ Usar elemento_id correcto (antes había error de nombre)
      await ElementoModel.crearSeriesPorElemento(elemento_id, seriesConFechaYUbicacion);

      // ✅ return para que no siga ejecutando y no mande dos respuestas
      return res.status(201).json({
        mensaje: `Elemento creado exitosamente con ID: ${elemento_id}`,
        id: elemento_id
      });
    } catch (error) {
      console.error('❌ Error al insertar series:', error.message || error);
      return res.status(500).json({ error: 'Error al insertar series', detalle: error.message });
    }
  }

  // 📌 Si no lleva serie, responder aquí
  return res.status(201).json({
    mensaje: `Elemento creado exitosamente con ID: ${elemento_id}`,
    id: elemento_id
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