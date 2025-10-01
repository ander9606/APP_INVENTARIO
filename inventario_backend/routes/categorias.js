// ============================================
// routes/categorias.js
// ============================================

import express from 'express';
import * as categoriasController from '../controllers/categoriasController.js';

const router = express.Router();

// Rutas específicas primero
router.get('/jerarquia', categoriasController.obtenerCategoriasJerarquicas);
router.get('/:id/subcategorias', categoriasController.obtenerSubcategorias);

// Rutas generales después
router.get('/', categoriasController.obtenerCategorias);
router.post('/', categoriasController.crearCategoria);
router.delete('/:id', categoriasController.eliminarCategoria);

export default router;
