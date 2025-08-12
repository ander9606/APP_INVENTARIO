// routes/categorias.js
const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');

// Obtener todas las categorías en listado plano
router.get('/', categoriasController.obtenerCategorias);

// Obtener todas las categorías en jerarquía (árbol)
router.get('/jerarquia', categoriasController.obtenerCategoriasJerarquicas);

// Obtener subcategorías de una categoría específica
router.get('/:id/subcategorias', categoriasController.obtenerSubcategorias);

// Crear nueva categoría o subcategoría
router.post('/', categoriasController.crearCategoria);

// Eliminar una categoría por ID
router.delete('/:id', categoriasController.eliminarCategoria);

module.exports = router;
