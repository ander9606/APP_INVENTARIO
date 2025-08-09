// routes/categorias.js
const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');

// Rutas básicas
router.get('/', categoriasController.obtenerCategorias); // plano
router.get('/jerarquia', categoriasController.obtenerCategoriasJerarquicas); // árbol
router.post('/', categoriasController.crearCategoria);
router.delete('/:id', categoriasController.eliminarCategoria);

// Obtener subcategorías de una categoría específica
router.get('/:id/subcategorias', categoriasController.obtenerSubcategorias);

module.exports = router;
