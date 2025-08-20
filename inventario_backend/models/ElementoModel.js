const db = require("./db"); // Importa la conexión desde models/db.js

/// 📂 models/ElementoModel.js
exports.obtenerTodos = async () => {
  try {
    const [filas] = await db.query(`
      SELECT
  e.id,
  e.nombre,
  e.descripcion,
  e.cantidad,
  e.requiere_series,
  e.material_id,
  e.unidad_id,
  e.estado,
  e.ubicacion,
  
  c.id AS subcategoria_id,
  COALESCE(c.nombre, '') AS subcategoria_nombre,
  c.padre_id AS categoria_id,
  
  COALESCE(cp.nombre, '') AS categoria_nombre
FROM elementos e
LEFT JOIN categorias c ON e.categoria_id = c.id
LEFT JOIN categorias cp ON c.padre_id = cp.id;
    `);

    console.log(`✅ Se obtuvieron ${filas.length} elementos`);
    console.log("📌 Elementos procesados desde la BD:", JSON.stringify(filas, null, 2));

    return filas;
  } catch (error) {
    console.error("❌ Error al obtener los elementos:", error);
    throw error;
  }
};


// Crear un nuevo elemento
exports.crear = async (elemento) => {
  try {
    const [resultado] = await db.query("INSERT INTO elementos SET ?", [
      elemento,
    ]);
    console.log(`✅ Elemento creado con ID: ${resultado.insertId}`);
    return resultado;
  } catch (error) {
    console.error("❌ Error al crear el elemento:", error);
    throw error;
  }
};

// Actualizar un elemento
exports.actualizar = async (id, datos) => {
  try {
    const [resultado] = await db.query("UPDATE elementos SET ? WHERE id = ?", [
      datos,
      id,
    ]);
    console.log(`✅ Elemento con ID ${id} actualizado correctamente`);
    return resultado;
  } catch (error) {
    console.error(`❌ Error al actualizar el elemento con ID ${id}:`, error);
    throw error;
  }
};

// Eliminar un elemento
exports.eliminar = async (id) => {
  try {
    const [resultado] = await db.query("DELETE FROM elementos WHERE id = ?", [
      id,
    ]);
    console.log(`🗑️ Elemento con ID ${id} eliminado`);
    return resultado;
  } catch (error) {
    console.error(`❌ Error al eliminar el elemento con ID ${id}:`, error);
    throw error;
  }
};

// Crear múltiples series asociadas a un elemento
exports.crearSeriesPorElemento = async (idElemento, series) => {
  const query = `
    INSERT INTO series (id_elemento, numero_serie, estado, fecha_ingreso, ubicacion)
    VALUES (?, ?, ?, ?, ?)
  `;

  for (const serie of series) {
    try {
      await db.execute(query, [
        idElemento,
        serie.numero_serie,
        serie.estado || "nuevo",
        serie.fecha_ingreso,
        serie.ubicacion || null,
      ]);
    } catch (error) {
      console.error(
        `❌ Error al insertar la serie ${serie.numero_serie}:`,
        error.message
      );
      throw error;
    }
  }
};
