// controllers/categoriasController.js
const db = require('../models/db');

// Obtener TODAS las categorías con sus relaciones (si quieres traerlas planas)
exports.obtenerCategorias = async (req, res) => {
  try {
    const [categorias] = await db.query('SELECT * FROM categorias');
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener categorías', error });
  }
};

// Obtener categorías jerárquicamente (agrupadas por padre e hijas)
exports.obtenerCategoriasJerarquicas = async (req, res) => {
  try {
    const [categorias] = await db.query('SELECT * FROM categorias');

    // Organizar jerárquicamente
    const arbol = categorias
      .filter(c => c.padre_id === null)
      .map(padre => ({
        ...padre,
        subcategorias: categorias.filter(hijo => hijo.padre_id === padre.id)
      }));

    res.json(arbol);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener jerarquía de categorías', error });
  }
};

// Crear una categoría o subcategoría
exports.crearCategoria = async (req, res) => {
  try {
    const { nombre, padre_id } = req.body;

    const [resultado] = await db.query(
      'INSERT INTO categorias (nombre, padre_id) VALUES (?, ?)',
      [nombre, padre_id || null]
    );

    res.json({ mensaje: 'Categoría creada', id: resultado.insertId });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear categoría', error });
  }
};

// Eliminar una categoría (se eliminan también sus subcategorías por ON DELETE CASCADE)
exports.eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM categorias WHERE id = ?', [id]);
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar categoría', error });
  }
};

exports.obtenerSubcategorias = async (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM categorias WHERE padre_id = ?', [id], (error, resultados) => {
        if (error) {
            console.error('Error al obtener subcategorías:', error);
            return res.status(500).json({ error: 'Error al obtener subcategorías' });
        }
        res.json(resultados);
    });
};