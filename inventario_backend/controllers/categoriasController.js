// controllers/categoriasController.js
const CategoriasModel = require('../models/CategoriasModel');
const { construirJerarquia } = require('../utils/categoriasUtils');

module.exports = {
    // Obtener todas las categorías planas
    async obtenerCategorias(req, res) {
        try {
            const categorias = await CategoriasModel.obtenerTodas();
            res.json(categorias);
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            res.status(500).json({ error: 'Error al obtener categorías' });
        }
    },

    // Obtener todas las categorías en forma jerárquica (árbol)
    async obtenerCategoriasJerarquicas(req, res) {
        try {
            const categorias = await CategoriasModel.obtenerTodas();
            const jerarquia = construirJerarquia(categorias);
            res.json(jerarquia);
        } catch (error) {
            console.error('Error al obtener jerarquía de categorías:', error);
            res.status(500).json({ error: 'Error al obtener jerarquía de categorías' });
        }
    },

    // Crear nueva categoría o subcategoría
    async crearCategoria(req, res) {
        try {
            const { nombre, descripcion, categoria_padre_id } = req.body;
            if (!nombre) {
                return res.status(400).json({ error: 'El nombre es obligatorio' });
            }

            const nuevaCategoria = await CategoriasModel.crear({
                nombre,
                descripcion,
                categoria_padre_id: categoria_padre_id || null
            });

            res.status(201).json(nuevaCategoria);
        } catch (error) {
            console.error('Error al crear categoría:', error);
            res.status(500).json({ error: 'Error al crear categoría' });
        }
    },

    // Eliminar categoría
    async eliminarCategoria(req, res) {
        try {
            const { id } = req.params;
            const resultado = await CategoriasModel.eliminar(id);

            if (resultado.affectedRows === 0) {
                return res.status(404).json({ error: 'Categoría no encontrada' });
            }

            res.json({ mensaje: 'Categoría eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            res.status(500).json({ error: 'Error al eliminar categoría' });
        }
    },

    // Obtener subcategorías de una categoría específica
    async obtenerSubcategorias(req, res) {
        try {
            const { id } = req.params;
            const subcategorias = await CategoriasModel.obtenerSubcategorias(id);
            res.json(subcategorias);
        } catch (error) {
            console.error('Error al obtener subcategorías:', error);
            res.status(500).json({ error: 'Error al obtener subcategorías' });
        }
    }
};
