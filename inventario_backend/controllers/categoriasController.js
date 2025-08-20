// controllers/categoriasController.js
const CategoriasModel = require('../models/CategoriasModel');
const { construirJerarquia } = require('../utils/construirArbol');

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

    // Obtener todas las categorías en forma jerárquica
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
            const { nombre, categoria_padre_id, padre_id } = req.body;

            if (!nombre) {
                return res.status(400).json({ error: 'El nombre es obligatorio' });
            }

            const nuevaCategoria = await CategoriasModel.crear({
                nombre,
                categoria_padre_id: categoria_padre_id || padre_id || null
            });

            res.status(201).json(nuevaCategoria);
        } catch (error) {
            console.error('Error al crear categoría:', error);
            res.status(500).json({ error: 'Error al crear categoría' });
        }
    },

    // Eliminar categoría y sus hijos recursivamente
    async eliminarCategoria(req, res) {
        const { id } = req.params;

        try {
            await eliminarHijos(id);
            await CategoriasModel.eliminar(id);

            res.json({ mensaje: "Categoría y sus hijos eliminados" });
        } catch (error) {
            console.error("Error eliminando categoría:", error);
            res.status(500).json({ error: "Error eliminando categoría" });
        }

        // 🔁 Función recursiva
        async function eliminarHijos(categoriaId) {
            const hijos = await CategoriasModel.obtenerSubcategorias(categoriaId);

            for (const hijo of hijos) {
                await eliminarHijos(hijo.id); // eliminar recursivo
                await CategoriasModel.eliminar(hijo.id);
            }
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
